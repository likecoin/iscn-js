/* eslint-disable max-len */
import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';
import {
  QueryClientImpl,
  QueryParamsResponse,
  QueryClassesByISCNResponse,
  QueryClassesByISCNIndexResponse,
  QueryISCNByClassResponse,
  QueryClassesByAccountResponse,
  QueryClassesByAccountIndexResponse,
  QueryAccountByClassResponse,
  QueryMintableNFTResponse,
  QueryMintableNFTIndexResponse,
  QueryMintableNFTsResponse,
} from '@likecoin/iscn-message-types/dist/likenft/query';
import { PageRequest } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';

export interface LikeNFTExtension {
  readonly likenft: {
    readonly classesByISCN: (iscnIdPrefix: string, pagination?: PageRequest) => Promise<QueryClassesByISCNResponse>;
    readonly classesByISCNIndex: (pagination?: PageRequest) => Promise<QueryClassesByISCNIndexResponse>;
    readonly ISCNByClass: (classId: string) => Promise<QueryISCNByClassResponse>;
    readonly classesByAccount: (account: string, pagination?: PageRequest) => Promise<QueryClassesByAccountResponse>;
    readonly classesByAccountIndex: (pagination?: PageRequest) => Promise<QueryClassesByAccountIndexResponse>;
    readonly accountByClass: (classId: string) => Promise<QueryAccountByClassResponse>;
    readonly mintableNFT: (classId: string, id: string) => Promise<QueryMintableNFTResponse>;
    readonly mintableNFTIndex: (pagination?: PageRequest) => Promise<QueryMintableNFTIndexResponse>;
    readonly mintableNFTs: (classId: string, pagination?: PageRequest) => Promise<QueryMintableNFTsResponse>;
    readonly params: () => Promise<QueryParamsResponse>
  };
}

export function setupLikeNFTExtension(base: QueryClient): LikeNFTExtension {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    likenft: {
      classesByISCN: (iscnIdPrefix, pagination) => queryService.ClassesByISCN({ iscnIdPrefix, pagination }),
      classesByISCNIndex: (pagination) => queryService.ClassesByISCNIndex({ pagination }),
      ISCNByClass: (classId) => queryService.ISCNByClass({ classId }),
      classesByAccount: (account, pagination) => queryService.ClassesByAccount({ account, pagination }),
      classesByAccountIndex: (pagination) => queryService.ClassesByAccountIndex({ pagination }),
      accountByClass: (classId) => queryService.AccountByClass({ classId }),
      mintableNFT: (classId, id) => queryService.MintableNFT({ classId, id }),
      mintableNFTIndex: (pagination) => queryService.MintableNFTIndex({ pagination }),
      mintableNFTs: (classId, pagination) => queryService.MintableNFTs({ classId, pagination }),
      params: () => queryService.Params({}),
    },
  };
}
