// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { ISCNSignPayload, Stakeholder } from '../types';

export function formatISCNPayload(payload: ISCNSignPayload, version = 1): {
    recordNotes?: string;
    contentFingerprints: string[];
    stakeholders: Uint8Array[];
    contentMetadata: Uint8Array;
  } {
  const {
    name,
    description,
    keywords = [],
    url,
    contentFingerprints,
    stakeholders: inputStakeHolders = [],
    type,
    usageInfo,
    recordNotes,
    ...data
  } = payload;

  const stakeholders = inputStakeHolders.map((s: Stakeholder) => Buffer.from(
    JSON.stringify(s),
    'utf8',
  ));
  const contentMetadata = {
    '@context': 'http://schema.org/',
    '@type': type,
    name,
    description,
    version,
    url,
    keywords: keywords.join(','),
    usageInfo,
    ...data,
  };
  return {
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  };
}

export function formatMsgCreateIscnRecord(
  senderAddress: string, payload: ISCNSignPayload,
): EncodeObject {
  const record = formatISCNPayload(payload);
  const message = {
    typeUrl: '/likechain.iscn.MsgCreateIscnRecord',
    value: {
      from: senderAddress,
      record,
    },
  };
  return message;
}

export function formatMsgUpdateIscnRecord(
  senderAddress: string, iscnId: string, payload: ISCNSignPayload,
): EncodeObject {
  const record = formatISCNPayload(payload);
  const message = {
    typeUrl: '/likechain.iscn.MsgUpdateIscnRecord',
    value: {
      from: senderAddress,
      iscnId,
      record,
    },
  };
  return message;
}

export function formatMsgChangeIscnRecordOwnership(
  senderAddress: string, iscnId: string, newOwnerAddress: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.iscn.MsgChangeIscnRecordOwnership',
    value: {
      from: senderAddress,
      iscnId,
      newOwner: newOwnerAddress,
    },
  };
  return message;
}
