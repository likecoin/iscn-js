import Long from "long";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import {
  QueryClientImpl,
  QueryRecordsByIdResponse,
  QueryRecordsByFingerprintResponse,
  QueryRecordsByOwnerResponse,
  QueryParamsResponse,
  QueryGetCidResponse,
  QueryHasCidResponse,
  QueryGetCidSizeResponse,
} from "@likecoin/iscn-message-types/dist/iscn/query";

export interface ISCNExtension {
  readonly iscn: {
    readonly recordsById: (iscnId: string, fromVersion?: number, toVersion?: number) => Promise<QueryRecordsByIdResponse>;
    readonly recordsByFingerprint: (fingerprint: string, fromSequence?: number) => Promise<QueryRecordsByFingerprintResponse>;
    readonly recordsByOwner: (owner: string, fromSequence?: number) => Promise<QueryRecordsByOwnerResponse>;
    readonly params: () => Promise<QueryParamsResponse>;
    readonly getCid: (cid: string) => Promise<QueryGetCidResponse>;
    readonly hasCid: (cid: string) => Promise<QueryHasCidResponse>;
    readonly getCidSize: (cid: string) => Promise<QueryGetCidSizeResponse>;
  };
}

export function setupISCNExtension(base: QueryClient): ISCNExtension {
  const rpc = createProtobufRpcClient(base);
  const queryService = new QueryClientImpl(rpc);
  return {
    iscn: {
      recordsById: (iscnId, fromVersion = 0, toVersion = 0) => queryService.RecordsById({
          iscnId,
          fromVersion: Long.fromNumber(fromVersion, true),
          toVersion: Long.fromNumber(toVersion, true),
        }),
      recordsByFingerprint: (fingerprint, fromSequence = 0) =>  queryService.RecordsByFingerprint({
        fingerprint,
        fromSequence: Long.fromNumber(fromSequence, true),
      }),
      recordsByOwner: (owner, fromSequence = 0) => queryService.RecordsByOwner({
        owner, fromSequence: Long.fromNumber(fromSequence, true),
      }),
      params: () => queryService.Params({}),
      getCid: (cid) => queryService.GetCid({ cid }),
      hasCid: (cid) => queryService.HasCid({ cid }),
      getCidSize: (cid) => queryService.GetCidSize({ cid }),
    }
  };
}