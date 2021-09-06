// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import {
  QueryClient, setupBankExtension, BankExtension, Coin, StargateClient,
} from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';

import { setupISCNExtension, ISCNExtension } from './ISCNQueryExtension';
import { parseISCNTxInfoFromIndexedTx, parseISCNTxRecordFromQuery } from './parsing';
import { ISCNRecord } from './types';
import { DEFAULT_RPC_ENDPOINT } from './constant';

export class ISCNQueryClient {
  queryClient: QueryClient & ISCNExtension & BankExtension | null = null;

  stargateClient: StargateClient | null = null;

  async connect(rpcURL = DEFAULT_RPC_ENDPOINT)
  // eslint-disable-next-line max-len
  : Promise<{ queryClient: QueryClient & ISCNExtension & BankExtension; stargateClient: StargateClient; }> {
    const [tendermintClient, stargateClient] = await Promise.all([
      Tendermint34Client.connect(rpcURL),
      StargateClient.connect(rpcURL),
    ]);
    const queryClient = QueryClient.withExtensions(
      tendermintClient,
      setupISCNExtension,
      setupBankExtension,
    );
    this.queryClient = queryClient;
    this.stargateClient = stargateClient;
    return {
      queryClient,
      stargateClient,
    };
  }

  async getQueryClient(): Promise<QueryClient & ISCNExtension & BankExtension> {
    let { queryClient } = this;
    if (!queryClient) ({ queryClient } = await this.connect());
    return queryClient;
  }

  async getStargateClient(): Promise<StargateClient> {
    let { stargateClient } = this;
    if (!stargateClient) ({ stargateClient } = await this.connect());
    return stargateClient;
  }

  async queryISCNIdsByTx(txId: string): Promise<string[]> {
    const stargateClient = await this.getStargateClient();
    const res = await stargateClient.getTx(txId);
    if (res) {
      const parsed = parseISCNTxInfoFromIndexedTx(res);
      const records: string[] = [];
      parsed.tx.body.messages.forEach((m, index) => {
        if (!m || !m.typeUrl.includes('/likechain.iscn')) return;
        const log = parsed.logs[index];
        const event = log.events.find((e: any) => e.type === 'iscn_record');
        if (!event) return;
        const { attributes } = event;
        const ipldAttr = attributes.find((a: any) => a.key === 'ipld');
        const ipld = ipldAttr && ipldAttr.value;
        const iscnIdAttr = attributes.find((a: any) => a.key === 'iscn_id');
        const iscnId = iscnIdAttr && iscnIdAttr.value;
        if (!ipld || !iscnId) return;
        records.push(iscnId);
      });
      return records;
    }
    return [];
  }

  async queryRecordsById(iscnId: string, fromVersion?: number, toVersion?: number) {
    const queryClient = await this.getQueryClient();
    const res = await queryClient.iscn.recordsById(iscnId, fromVersion, toVersion);
    if (res && res.records) {
      const records = parseISCNTxRecordFromQuery(res.records);
      return {
        ...res,
        records,
      };
    }
    return null;
  }

  async queryRecordsByFingerprint(fingerprint: string, fromSequence?: number) {
    const queryClient = await this.getQueryClient();
    const res = await queryClient.iscn.recordsByFingerprint(fingerprint, fromSequence);
    if (res && res.records) {
      const records = parseISCNTxRecordFromQuery(res.records);
      return {
        ...res,
        records,
      };
    }
    return null;
  }

  async queryRecordsByOwner(owner: string, fromSequence?: number) {
    const queryClient = await this.getQueryClient();
    const res = await queryClient.iscn.recordsByOwner(owner, fromSequence);
    if (res && res.records) {
      const records = parseISCNTxRecordFromQuery(res.records);
      return {
        ...res,
        records,
      };
    }
    return null;
  }

  async queryFeePerByte(): Promise<Coin | null> {
    const queryClient = await this.getQueryClient();
    const res = await queryClient.iscn.params();
    if (res && res.params && res.params.feePerByte) {
      const {
        denom,
        amount,
      } = res.params.feePerByte;
      return {
        denom,
        amount: new BigNumber(amount).shiftedBy(-18).toFixed(),
      } as Coin;
    }
    return null;
  }
}

export default ISCNQueryClient;
