// eslint-disable-next-line import/no-extraneous-dependencies
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { IndexedTx } from '@cosmjs/stargate';
import { QueryResponseRecord } from '@likecoin/iscn-message-types/dist/likechain/iscn/query';
import {
  IscnRecord,
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/likechain/iscn/tx';
import { Class, NFT } from 'cosmjs-types/cosmos/nft/v1beta1/nft';
import { NFTData } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/nft_data';
import { ClassData } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/class_data';
import { MsgGrant } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { GenericAuthorization, Grant } from 'cosmjs-types/cosmos/authz/v1beta1/authz';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { StakeAuthorization } from 'cosmjs-types/cosmos/staking/v1beta1/authz';
import { Buffer } from 'buffer/';
import {
  ISCNRecord, ISCNRecordData, LikeNFT, LikeNFTClass, ParsedISCNTx,
} from '../types';
import { messageRegistryMap } from './registry';

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

export function parseNFTClassDataFields(record: Class): LikeNFTClass {
  let data;
  if (record.data && record.data.typeUrl === '/likechain.likenft.v1.ClassData') {
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

export function parseNFTDataFields(record: NFT): LikeNFT {
  let data;
  if (record.data && record.data.typeUrl === '/likechain.likenft.v1.NFTData') {
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

export function parseAuthzGrant(grant: Grant) {
  const { authorization } = grant;
  if (!authorization) return grant;
  let authorizationValue;
  switch (authorization.typeUrl) {
    case '/cosmos.bank.v1beta1.SendAuthorization': {
      authorizationValue = SendAuthorization.decode(authorization.value);
      break;
    }
    case '/cosmos.staking.v1beta1.StakeAuthorization': {
      authorizationValue = StakeAuthorization.decode(authorization.value);
      break;
    }
    case '/cosmos.authz.v1beta1.GenericAuthorization': {
      authorizationValue = GenericAuthorization.decode(authorization.value);
      break;
    }
    default:
  }
  return {
    ...grant,
    authorization: {
      typeUrl: authorization.typeUrl,
      value: authorizationValue,
    },
  };
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
      case '/cosmos.authz.v1beta1.MsgGrant': {
        msg = MsgGrant.decode(m.value);
        if (msg.grant) {
          const grant = parseAuthzGrant(msg.grant);
          msg = {
            ...msg,
            grant,
          };
        }
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

export function parseISCNTxRecordFromQuery(records: QueryResponseRecord[]): ISCNRecord[] {
  return records.map((r): ISCNRecord => {
    const { data, ipld } = r;
    const parsedData = JSON.parse(Buffer.from(data).toString('utf-8'));
    return {
      ipld,
      data: parsedData,
    };
  });
}
