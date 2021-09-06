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
  entity: Entity,
  rewardProportion: number,
  contributionType: string
}

export interface ISCNSignPayload {
  name: string;
  description: string;
  keywords: string[];
  url: string;
  contentFingerprints: string[];
  stakeholders: Stakeholder[];
  type: string;
  usageInfo: string;
  recordNotes: string;
}
