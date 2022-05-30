// eslint-disable-next-line import/no-extraneous-dependencies
import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import {
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/iscn/tx';
import {
  MsgNewClass,
  MsgUpdateClass,
  MsgMintNFT,
  MsgBurnNFT,
  MsgCreateMintableNFT,
  MsgUpdateMintableNFT,
  MsgDeleteMintableNFT,
} from '@likecoin/iscn-message-types/dist/likenft/tx';
import { MsgSend as MsgSendNFT } from '@likecoin/iscn-message-types/dist/nft/tx';
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';
import { defaultRegistryTypes } from '@cosmjs/stargate';

const registryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord],
  ['/likechain.iscn.MsgUpdateIscnRecord', MsgUpdateIscnRecord],
  ['/likechain.iscn.MsgChangeIscnRecordOwnership', MsgChangeIscnRecordOwnership],
  ['/cosmos.nft.v1beta1.MsgSend', MsgSendNFT],
  ['/likechain.likenft.MsgNewClass', MsgNewClass],
  ['/likechain.likenft.MsgUpdateClass', MsgUpdateClass],
  ['/likechain.likenft.MsgMintNFT', MsgMintNFT],
  ['/likechain.likenft.MsgBurnNFT', MsgBurnNFT],
  ['/likechain.likenft.MsgCreateMintableNFT', MsgCreateMintableNFT],
  ['/likechain.likenft.MsgUpdateMintableNFT', MsgUpdateMintableNFT],
  ['/likechain.likenft.MsgDeleteMintableNFT', MsgDeleteMintableNFT],
];

export const messageRegistryMap = registryTypes
  .reduce((acc: { [key: string]: GeneratedType }, cur) => {
    const [key, value] = cur;
    acc[key] = value;
    return acc;
  }, {});

export const messageRegistry = new Registry(registryTypes);

export function formatGrantMsg(
  granter: string,
  grantee: string,
  type: string,
  value: Uint8Array,
  expirationInMs: number,
) {
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
