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
  [key:string]: unknown,
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
