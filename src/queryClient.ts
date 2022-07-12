import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import {
  QueryClient, setupBankExtension, BankExtension, Coin, StargateClient,
} from '@cosmjs/stargate';
import { setupAuthzExtension, AuthzExtension } from '@cosmjs/stargate/build/modules/authz/queries';
import { PageRequest, PageResponse } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';
import { NFT } from '@likecoin/iscn-message-types/dist/backport/nft/v1beta1/nft';

import { setupISCNExtension, ISCNExtension } from './queryExtensions/ISCNQueryExtension';
import { setupNFTExtension, NFTExtension } from './queryExtensions/NFTQueryExtension';
import { setupLikeNFTExtension, LikeNFTExtension } from './queryExtensions/LikeNFTQueryExtension';
import {
  parseTxInfoFromIndexedTx,
  parseISCNTxRecordFromQuery,
  parseNFTClassDataFields,
  parseNFTDataFields,
} from './messages/parsing';
import { DEFAULT_RPC_ENDPOINT } from './constant';
import { LikeNFT, LikeNFTClass } from './types';

export class ISCNQueryClient {
  private queryClient: QueryClient
    & ISCNExtension
    & BankExtension & AuthzExtension
    & NFTExtension & LikeNFTExtension | null = null;

  private stargateClient: StargateClient | null = null;

  private feePerByte: Coin | null = null;

  async connect(rpcURL = DEFAULT_RPC_ENDPOINT)
    // eslint-disable-next-line max-len
    : Promise<{ queryClient: QueryClient
      & ISCNExtension & BankExtension & AuthzExtension
      & NFTExtension & LikeNFTExtension;
      stargateClient: StargateClient; }> {
    const [tendermintClient, stargateClient] = await Promise.all([
      Tendermint34Client.connect(rpcURL),
      StargateClient.connect(rpcURL),
    ]);
    const queryClient = QueryClient.withExtensions(
      tendermintClient,
      setupAuthzExtension,
      setupISCNExtension,
      setupNFTExtension,
      setupLikeNFTExtension,
      setupBankExtension,
    );
    this.queryClient = queryClient;
    this.stargateClient = stargateClient;
    this.feePerByte = null;
    return {
      queryClient,
      stargateClient,
    };
  }

  async getQueryClient(): Promise<QueryClient
    & ISCNExtension & BankExtension & NFTExtension & LikeNFTExtension> {
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
      const parsed = parseTxInfoFromIndexedTx(res);
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
    if (this.feePerByte) return this.feePerByte;
    const queryClient = await this.getQueryClient();
    const res = await queryClient.iscn.params();
    if (res && res.params && res.params.feePerByte) {
      const {
        denom,
        amount,
      } = res.params.feePerByte;
      this.feePerByte = {
        denom,
        amount: new BigNumber(amount).shiftedBy(-18).toFixed(),
      } as Coin;
      return this.feePerByte;
    }
    return null;
  }

  async queryNFTClass(classId: string): Promise<{ class: LikeNFTClass }|null> {
    const queryClient = await this.getQueryClient();
    const { class: classData } = await queryClient.nft.class(classId);
    if (!classData) return null;
    return { class: parseNFTClassDataFields(classData) };
  }

  async queryNFTClasses(pagination?: PageRequest):
    Promise<{ classes: LikeNFTClass[]; pagination?: PageResponse; }> {
    const queryClient = await this.getQueryClient();
    const { classes, ...res } = await queryClient.nft.classes(pagination);
    return { classes: classes.map((c) => parseNFTClassDataFields(c)), ...res };
  }

  async queryNFT(classId: string, nftId: string): Promise<{ nft: LikeNFT } | null> {
    const queryClient = await this.getQueryClient();
    const { nft } = await queryClient.nft.NFT(classId, nftId);
    if (!nft) return null;
    return { nft: parseNFTDataFields(nft) };
  }

  async queryNFTByClassAndOwner(classId: string, owner: string, pagination?: PageRequest):
    Promise<{ nfts: LikeNFT[]; pagination?: PageResponse; }> {
    const queryClient = await this.getQueryClient();
    const { nfts, ...res } = await queryClient.nft.NFTs(classId, owner, pagination);
    return { nfts: nfts.map((n: NFT) => parseNFTDataFields(n)), ...res };
  }

  async queryNFTClassIdByTx(txId: string): Promise<string> {
    const stargateClient = await this.getStargateClient();
    const res = await stargateClient.getTx(txId);
    if (res) {
      const parsed = parseTxInfoFromIndexedTx(res);
      if (!parsed.logs.length) return '';
      const event = parsed.logs[0].events.find((e: { type: string }) => e.type === 'likechain.likenft.v1.EventNewClass');
      if (!event) return '';
      const attribute = event.attributes.find((a: { key: string }) => a.key === 'class_id');
      // class id here might contain extra `""`s
      // https://github.com/oursky/likecoin-chain/issues/277
      return (attribute?.value || '').replace(/^"(.*)"$/, '$1');
    }
    return '';
  }
}

export default ISCNQueryClient;
