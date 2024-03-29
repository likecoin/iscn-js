import { createHash } from 'crypto';
import jsonStableStringify from 'fast-json-stable-stringify';
import { formatISCNPayload } from '../messages/iscn';
import { ISCNSignPayload } from '../types';

export function getMsgCreateISCNRecordJSON(
  iscnSender: string,
  payload: ISCNSignPayload,
  nonce = 0,
): string {
  const bufferRecord = formatISCNPayload(payload);
  const stringRecord = {
    recordNotes: bufferRecord.recordNotes,
    contentFingerprints: bufferRecord.contentFingerprints,
    stakeholders: bufferRecord.stakeholders
      .map((b) => b.toString())
      .map((s) => JSON.parse(s)),
    contentMetadata: JSON.parse(bufferRecord.contentMetadata.toString()),
  };
  const record = { contentMetadata: null } as any;
  Object.entries(stringRecord).forEach(([key, value]) => {
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

// reference to: https://pkg.go.dev/encoding/json#Marshal
function escapeUnsafeChar(s: string): string {
  return s
    .replace(/\\b/g, '\\u0008')
    .replace(/\\v/g, '\\u000b')
    .replace(/\\f/g, '\\u000c')
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function getISCNIdPrefix(from: string, payload: ISCNSignPayload, nonce = 0, registryName = 'likecoin-chain'): string {
  const json = getMsgCreateISCNRecordJSON(from, payload, nonce);
  const escaped = escapeUnsafeChar(json);
  const sha256 = createHash('sha256');
  return sha256.update(`${registryName}/${escaped}`).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
