// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { AminoConverter } from '@cosmjs/stargate';
import { GenericAuthorization } from 'cosmjs-types/cosmos/authz/v1beta1/authz';
import { MsgGrant, MsgRevoke } from 'cosmjs-types/cosmos/authz/v1beta1/tx';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

export function formatMsgGrant(
  granter: string,
  grantee: string,
  type: string,
  value: Uint8Array,
  expirationDateInMs: number,
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
          seconds: Math.floor(expirationDateInMs / 1000),
          nanos: 0,
        }),
      },
    },
  };
}

export function formatMsgGrantSendAuthorization(
  senderAddress: string,
  granteeAddress: string,
  spendLimit: Coin[],
  expirationDateInMs: number,
): EncodeObject {
  return formatMsgGrant(
    senderAddress,
    granteeAddress,
    '/cosmos.bank.v1beta1.SendAuthorization',
    SendAuthorization.encode(
      SendAuthorization.fromPartial({
        spendLimit,
      }),
    ).finish(),
    expirationDateInMs,
  );
}

export function formatMsgExecSendAuthorization(
  execAddress: string,
  granterAddress: string,
  toAddress: string,
  amounts: Coin[],
): EncodeObject {
  const message = {
    typeUrl: '/cosmos.authz.v1beta1.MsgExec',
    value: {
      grantee: execAddress,
      msgs: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: MsgSend.encode(
            MsgSend.fromPartial({
              fromAddress: granterAddress,
              toAddress,
              amount: amounts,
            }),
          ).finish(),
        },
      ],
    },
  };
  return message;
}

export function formatMsgRevokeSendAuthorization(
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

export function createAuthzAminoConverters(): Record<string, AminoConverter> {
  return {
    '/cosmos.authz.v1beta1.MsgGrant': {
      aminoType: 'cosmos-sdk/MsgGrant',
      toAmino: ({ granter, grantee, grant }: MsgGrant) => {
        if (!grant || !grant.authorization) {
          throw new Error(
            `Unsupported grant type: '${grant?.authorization?.typeUrl}'`,
          );
        }
        let authorizationValue;
        switch (grant?.authorization?.typeUrl) {
          case '/cosmos.authz.v1beta1.GenericAuthorization': {
            const generic = GenericAuthorization.decode(
              grant.authorization.value,
            );
            authorizationValue = {
              type: 'cosmos-sdk/GenericAuthorization',
              value: {
                msg: generic.msg,
              },
            };
            break;
          }
          case '/cosmos.bank.v1beta1.SendAuthorization': {
            const spend = SendAuthorization.decode(grant.authorization.value);
            authorizationValue = {
              type: 'cosmos-sdk/SendAuthorization',
              value: {
                spend_limit: spend.spendLimit,
              },
            };
            break;
          }
          default:
            throw new Error(
              `Unsupported grant type: '${grant.authorization.typeUrl}'`,
            );
        }
        const expiration = grant.expiration?.seconds;
        return {
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: expiration
              ? new Date(expiration.toNumber() * 1000).toISOString().replace(/\.000Z$/, 'Z')
              : undefined,
          },
        };
      },
      fromAmino: ({ granter, grantee, grant }: {
        granter: string; grantee: string; grant: any;
      }): MsgGrant => {
        const authorizationType = grant?.authorization?.type;
        let authorizationValue;
        switch (authorizationType) {
          case 'cosmos-sdk/GenericAuthorization': {
            authorizationValue = {
              typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
              value: GenericAuthorization
                .encode({ msg: grant.authorization.value.msg })
                .finish(),
            };
            break;
          }
          case 'cosmos-sdk/SendAuthorization': {
            authorizationValue = {
              typeUrl: '/cosmos.bank.v1beta1.SendAuthorization',
              value: SendAuthorization
                .encode(SendAuthorization
                  .fromPartial({ spendLimit: grant.authorization.value.spend_limit }))
                .finish(),
            };
            break;
          }
          default:
            throw new Error(
              `Unsupported grant type: '${grant?.authorization?.type}'`,
            );
        }
        const expiration = grant.expiration
          ? Date.parse(grant.expiration)
          : undefined;
        return MsgGrant.fromPartial({
          granter,
          grantee,
          grant: {
            authorization: authorizationValue,
            expiration: expiration
              ? Timestamp.fromPartial({
                seconds: expiration / 1000,
                nanos: (expiration % 1000) * 1e6,
              })
              : undefined,
          },
        });
      },
    },
    '/cosmos.authz.v1beta1.MsgRevoke': {
      aminoType: 'cosmos-sdk/MsgRevoke',
      toAmino: ({ granter, grantee, msgTypeUrl }: MsgRevoke) => ({
        granter,
        grantee,
        msg_type_url: msgTypeUrl,
      }),
      /* eslint-disable camelcase */
      fromAmino: ({ granter, grantee, msg_type_url }: {
        granter: string, grantee: string, msg_type_url: string
      }): MsgRevoke => MsgRevoke.fromPartial({
        granter,
        grantee,
        msgTypeUrl: msg_type_url,
      }),
      /* eslint-enable camelcase */
    },
  };
}
