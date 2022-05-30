// eslint-disable-next-line import/no-extraneous-dependencies
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { IndexedTx } from '@cosmjs/stargate';
import { QueryResponseRecord } from '@likecoin/iscn-message-types/dist/iscn/query';
import {
  IscnRecord,
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/iscn/tx';
import { Class, NFT } from '@likecoin/iscn-message-types/dist/nft/nft';
import { NFTData } from '@likecoin/iscn-message-types/dist/likenft/nft_data';
import { ClassData } from '@likecoin/iscn-message-types/dist/likenft/class_data';
import { ISCNRecord, ISCNRecordData, ParsedISCNTx } from './types';
import { messageRegistryMap } from './messageRegistry';

export function parseISCNRecordFields(record: IscnRecord): ISCNRecordData {
  const {
    stakeholders,
    contentMetadata,
  } = record;
  return {
    ...record,
    stakeholders: stakeholders.map((s: Uint8Array) => {
      if (s) {
        const sString = Buffer.from(s).toString('utf-8');
        if (sString) return JSON.parse(sString);
      }
      return s;
    }),
    contentMetadata: JSON.parse(Buffer.from(contentMetadata).toString('utf-8')),
  };
}

export function parseNFTClassDataFields(record: Class) {
  let data;
  if (record.data && record.data.typeUrl === '/likechain.likenft.ClassData') {
    data = ClassData.decode(record.data.value);
    if (data.metadata) {
      const metadataString = Buffer.from(data.metadata).toString('utf-8');
      if (metadataString) {
        data.metadata = JSON.parse(metadataString);
      }
    }
    return data ? {
      ...record,
      data,
    } : record;
  }
  return record;
}

export function parseNFTDataFields(record: NFT) {
  let data;
  if (record.data && record.data.typeUrl === '/likechain.likenft.NFTData') {
    data = NFTData.decode(record.data.value);
    if (data.metadata) {
      const metadataString = Buffer.from(data.metadata).toString('utf-8');
      if (metadataString) {
        data.metadata = JSON.parse(metadataString);
      }
    }
    return data ? {
      ...record,
      data,
    } : record;
  }
  return record;
}

export function parseTxInfoFromIndexedTx(tx: IndexedTx): ParsedISCNTx {
  const { tx: txBytes, rawLog } = tx;
  const decodedTx = decodeTxRaw(txBytes);
  const messages = decodedTx.body.messages.map((m) => {
    let msg;
    switch (m.typeUrl) {
      case '/likechain.iscn.MsgCreateIscnRecord': {
        msg = MsgCreateIscnRecord.decode(m.value);
        if (msg.record) {
          msg.record = parseISCNRecordFields(msg.record);
        }
        break;
      }
      case '/likechain.iscn.MsgUpdateIscnRecord': {
        msg = MsgUpdateIscnRecord.decode(m.value);
        if (msg.record) {
          msg.record = parseISCNRecordFields(msg.record);
        }
        break;
      }
      case '/likechain.iscn.MsgChangeIscnRecordOwnership': {
        msg = MsgChangeIscnRecordOwnership.decode(m.value);
        break;
      }
      default: {
        if (messageRegistryMap[m.typeUrl]) {
          msg = messageRegistryMap[m.typeUrl].decode(m.value);
        }
      }
    }
    return msg ? {
      ...m,
      value: msg,
    } : m;
  });
  return {
    ...tx,
    logs: JSON.parse(rawLog),
    tx: {
      ...decodedTx,
      body: {
        ...decodedTx.body,
        messages: messages.filter((m) => !!m),
      },
    },
  };
}

export function parseISCNTxRecordFromQuery(records: QueryResponseRecord[]) {
  return records.map((r): ISCNRecord => {
    const { data, ipld } = r;
    const parsedData = JSON.parse(Buffer.from(data).toString('utf-8'));
    return {
      ipld,
      data: parsedData,
    };
  });
}
