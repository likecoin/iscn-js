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
  QueryBlindBoxContentResponse,
  QueryBlindBoxContentIndexResponse,
  QueryBlindBoxContentsResponse,
} from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/query';
import { PageRequest } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';

export interface LikeNFTExtension {
  readonly likenft: {
    readonly classesByISCN: (iscnIdPrefix: string, pagination?: PageRequest) => Promise<QueryClassesByISCNResponse>;
    readonly classesByISCNIndex: (pagination?: PageRequest) => Promise<QueryClassesByISCNIndexResponse>;
    readonly ISCNByClass: (classId: string) => Promise<QueryISCNByClassResponse>;
    readonly classesByAccount: (account: string, pagination?: PageRequest) => Promise<QueryClassesByAccountResponse>;
    readonly classesByAccountIndex: (pagination?: PageRequest) => Promise<QueryClassesByAccountIndexResponse>;
    readonly accountByClass: (classId: string) => Promise<QueryAccountByClassResponse>;
    readonly BlindBoxContent: (classId: string, id: string) => Promise<QueryBlindBoxContentResponse>;
    readonly BlindBoxContentIndex: (pagination?: PageRequest) => Promise<QueryBlindBoxContentIndexResponse>;
    readonly BlindBoxContents: (classId: string, pagination?: PageRequest) => Promise<QueryBlindBoxContentsResponse>;
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
      BlindBoxContent: (classId, id) => queryService.BlindBoxContent({ classId, id }),
      BlindBoxContentIndex: (pagination) => queryService.BlindBoxContentIndex({ pagination }),
      BlindBoxContents: (classId, pagination) => queryService.BlindBoxContents({ classId, pagination }),
      params: () => queryService.Params({}),
    },
  };
}
