// eslint-disable-next-line import/no-extraneous-dependencies
import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import {
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/likechain/iscn/tx';
import {
  MsgNewClass,
  MsgUpdateClass,
  MsgMintNFT,
  MsgBurnNFT,
  MsgCreateBlindBoxContent,
  MsgUpdateBlindBoxContent,
  MsgDeleteBlindBoxContent,
  MsgCreateRoyaltyConfig,
  MsgUpdateRoyaltyConfig,
  MsgDeleteRoyaltyConfig,
} from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/tx';
import { MsgSend as MsgSendNFT } from '@likecoin/iscn-message-types/dist/backport/nft/v1beta1/tx';
import { defaultRegistryTypes } from '@cosmjs/stargate';

export const ISCNRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord],
  ['/likechain.iscn.MsgUpdateIscnRecord', MsgUpdateIscnRecord],
  ['/likechain.iscn.MsgChangeIscnRecordOwnership', MsgChangeIscnRecordOwnership],
];
export const LikeNFTRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ['/cosmos.nft.v1beta1.MsgSend', MsgSendNFT],
  ['/likechain.likenft.v1.MsgNewClass', MsgNewClass],
  ['/likechain.likenft.v1.MsgUpdateClass', MsgUpdateClass],
  ['/likechain.likenft.v1.MsgMintNFT', MsgMintNFT],
  ['/likechain.likenft.v1.MsgBurnNFT', MsgBurnNFT],
  ['/likechain.likenft.v1.MsgCreateBlindBoxContent', MsgCreateBlindBoxContent],
  ['/likechain.likenft.v1.MsgUpdateBlindBoxContent', MsgUpdateBlindBoxContent],
  ['/likechain.likenft.v1.MsgDeleteBlindBoxContent', MsgDeleteBlindBoxContent],
  ['/likechain.likenft.v1.MsgCreateRoyaltyConfig', MsgCreateRoyaltyConfig],
  ['/likechain.likenft.v1.MsgUpdateRoyaltyConfig', MsgUpdateRoyaltyConfig],
  ['/likechain.likenft.v1.MsgDeleteRoyaltyConfig', MsgDeleteRoyaltyConfig],
];

export const registryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ...defaultRegistryTypes,
  ...ISCNRegistryTypes,
  ...LikeNFTRegistryTypes,
];

export const messageRegistryMap = registryTypes
  .reduce((acc: { [key: string]: GeneratedType }, cur) => {
    const [key, value] = cur;
    acc[key] = value;
    return acc;
  }, {});

export const messageRegistry = new Registry(registryTypes);
