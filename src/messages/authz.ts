// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

export function formatMsgGrant(
  granter: string,
  grantee: string,
  type: string,
  value: Uint8Array,
  expirationInMs: number,
): EncodeObject {
  return {
    typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
    value: {
      granter,
      grantee,
      grant: {
        authorization: {
          typeUrl: type,
          value,
        },
        expiration: Timestamp.fromPartial({
          seconds: Math.floor(expirationInMs / 1000),
          nanos: 0,
        }),
      },
    },
  };
}

export function formatSendAuthorizationMsgGrant(
  senderAddress: string,
  granteeAddress: string,
  spendLimit: Coin[],
  expirationInMs: number,
): EncodeObject {
  return formatMsgGrant(
    senderAddress,
    granteeAddress,
    '/cosmos.bank.v1beta1.SendAuthorization',
    SendAuthorization.encode(SendAuthorization.fromPartial({
      spendLimit,
    })).finish(),
    expirationInMs,
  );
}

export function formatSendAuthorizationMsgExec(
  execAddress: string,
  granterAddress: string,
  toAddress: string,
  amounts: Coin[],
): EncodeObject {
  const message = {
    typeUrl: '/cosmos.authz.v1beta1.MsgExec',
    value: {
      grantee: execAddress,
      msgs: [{
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: MsgSend.encode(MsgSend.fromPartial({
          fromAddress: granterAddress,
          toAddress,
          amount: amounts,
        })).finish(),
      }],
    },
  };
  return message;
}

export function formatSendAuthorizationMsgRevoke(
  senderAddress: string,
  granteeAddress: string,
): EncodeObject {
  const message = {
    typeUrl: '/cosmos.authz.v1beta1.MsgRevoke',
    value: {
      granter: senderAddress,
      grantee: granteeAddress,
      msgTypeUrl: '/cosmos.bank.v1beta1.MsgSend',
    },
  };
  return message;
}
