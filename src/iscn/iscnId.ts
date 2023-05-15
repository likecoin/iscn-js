import { createHash } from 'crypto';
import jsonStableStringify from 'fast-json-stable-stringify';
import { ISCNRecordData } from '../types';

export function getMsgCreateIscnRecordJSON(
  iscnSender: string,
  iscnRecord: ISCNRecordData,
  nonce = 0,
): string {
  const record = {} as any;
  Object.entries(iscnRecord).forEach(([key, value]) => {
    if (typeof value === 'string' && value !== '') {
      // handle recordNotes
      record[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      // handle contentFingerprints and stakeholders
      record[key] = value;
    } else if (key === 'contentMetadata') {
      // handle contentMetadata
      record[key] = value;
    }
  });
  const obj = {
    type: 'likecoin-chain/MsgCreateIscnRecord',
    value: {
      from: iscnSender,
      record,
    },
  } as any;
  if (nonce) {
    obj.value.nonce = nonce.toString();
  }
  return jsonStableStringify(obj);
}

export function getISCNIdPrefix(from: string, payload: ISCNRecordData, nonce = 0, registryName = 'likecoin-chain'): string {
  const json = getMsgCreateIscnRecordJSON(from, payload, nonce);
  const sha256 = createHash('sha256');
  return sha256.update(`${registryName}/${json}`).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
