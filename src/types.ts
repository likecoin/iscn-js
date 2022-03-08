import { StdFee } from '@cosmjs/stargate';
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

export interface ISCNRecordData {
  stakeholders: any[];
  contentMetadata: any;
  recordNotes: string;
  contentFingerprints: string[];
}

export interface ISCNRecord {
  ipld: string;
  data: ISCNRecordData & {[key:string]: unknown};
}

export interface Entity {
  '@id': string;
  name?: string;
  url?: string;
}

export interface Stakeholder {
  entity?: Entity & {[key:string]: unknown},
  rewardProportion?: number,
  contributionType?: string
}

export interface ISCNSignPayload {
  [key: string]: unknown,
  name: string;
  description?: string;
  keywords?: string[];
  url?: string;
  contentFingerprints: string[];
  stakeholders: (Stakeholder & unknown)[];
  type?: string;
  usageInfo?: string;
  recordNotes?: string;
}

export interface ISCNSignOptions {
  memo?: string,
  broadcast?: boolean,
  accountNumber?: number,
  sequence?: number,
  chainId?: string,
  gasPrice?: number,
  fee?: StdFee,
}
export interface ParsedISCNTx {
  readonly height: number;
  readonly hash: string;
  readonly code: number;
  readonly rawLog: string;
  readonly tx: {
    readonly authInfo: AuthInfo;
    readonly body: {
      messages: {
        typeUrl: string;
        value: any;
      }[];
      memo: string;
    };
    readonly signatures: readonly Uint8Array[];
  };
  readonly logs: {
    events: {
      type: string;
      attributes: {
        key: string;
        value: string;
      }[];
    }[];
  }[];
  readonly gasUsed: number;
  readonly gasWanted: number;
}
