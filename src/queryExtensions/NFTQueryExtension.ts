/* eslint-disable max-len */
import { createProtobufRpcClient, QueryClient } from '@cosmjs/stargate';
import {
  QueryClientImpl,
  QueryBalanceResponse,
  QueryClassResponse,
  QueryClassesResponse,
  QueryNFTResponse,
  QueryNFTsResponse,
  QueryOwnerResponse,
  QuerySupplyResponse,
} from '@likecoin/iscn-message-types/dist/backport/nft/v1beta1/query';
import { PageRequest } from 'cosmjs-types/cosmos/base/query/v1beta1/pagination';

export interface NFTExtension {
  readonly nft: {
    readonly balance: (classId: string, owner: string) => Promise<QueryBalanceResponse>;
    readonly class: (classId: string) => Promise<QueryClassResponse>;
    readonly classes: (pagination?: PageRequest) => Promise<QueryClassesResponse>;
    readonly NFT: (classId: string, id: string) => Promise<QueryNFTResponse>;
    readonly NFTs: (classId: string, owner: string, pagination?: PageRequest) => Promise<QueryNFTsResponse>;
    readonly owner: (classId: string, id: string) => Promise<QueryOwnerResponse>;
    readonly supply: (classId: string, id: string) => Promise<QuerySupplyResponse>;
  };
}

export function setupNFTExtension(base: QueryClient): NFTExtension {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    nft: {
      balance: (classId, owner) => queryService.Balance({ classId, owner }),
      class: (classId) => queryService.Class({ classId }),
      classes: (pagination) => queryService.Classes({ pagination }),
      NFT: (classId, id) => queryService.NFT({ classId, id }),
      NFTs: (classId, owner, pagination) => queryService.NFTs({ classId, owner, pagination }),
      owner: (classId, id) => queryService.Owner({ classId, id }),
      supply: (classId) => queryService.Supply({ classId }),
    },
  };
}
