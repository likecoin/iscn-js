// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClient, setupBankExtension, BankExtension } from "@cosmjs/stargate";
import { Coin } from "@cosmjs/stargate";
import { QueryResponseRecord } from "@likecoin/iscn-message-types/dist/iscn/query";
import BigNumber from 'bignumber.js';

import { setupISCNExtension, ISCNExtension } from "./ISCNQueryExtension";
import { ISCNRecord } from "./types";


function parseISCNTxRecordFromQuery(records: QueryResponseRecord[]) {
  return records.map((r): ISCNRecord => {
    const { data, ipld } = r;
    const parsedData = JSON.parse(Buffer.from(data).toString('utf-8'));
    return {
      ipld,
      data: parsedData,
    }
  });
}

export class ISCNQueryClient {
  queryClient: QueryClient & ISCNExtension & BankExtension | null = null;

  async connect({ rpcURL = '' }: { rpcURL?: string} = {}) {
    const tendermintClient = await Tendermint34Client.connect(rpcURL);
    this.queryClient = QueryClient.withExtensions(
      tendermintClient,
      setupISCNExtension,
      setupBankExtension,
    );
    return this.queryClient;
  }

  async getQueryClient() {
    let queryClient = this.queryClient;
    if (!queryClient) queryClient = await this.connect();
    return queryClient;
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

  async queryFeePerByte() {
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
    return 0;
  }
}

export default ISCNQueryClient;
