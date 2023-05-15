// eslint-disable-next-line import/no-extraneous-dependencies
import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import {
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/likechain/iscn/tx';
import { UpdateAuthorization } from '@likecoin/iscn-message-types/dist/likechain/iscn/authz';
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
  MsgCreateListing,
  MsgUpdateListing,
  MsgDeleteListing,
  MsgBuyNFT,
  MsgCreateOffer,
  MsgUpdateOffer,
  MsgDeleteOffer,
  MsgSellNFT,
} from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/tx';
import {
  CreateRoyaltyConfigAuthorization,
  UpdateRoyaltyConfigAuthorization,
  DeleteRoyaltyConfigAuthorization,
  CreateListingAuthorization,
  UpdateListingAuthorization,
  DeleteListingAuthorization,
  CreateOfferAuthorization,
  UpdateOfferAuthorization,
  DeleteOfferAuthorization,
  NewClassAuthorization,
  UpdateClassAuthorization,
  MintNFTAuthorization,
  SendNFTAuthorization,
} from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/authz';
import { MsgSend as MsgSendNFT } from 'cosmjs-types/cosmos/nft/v1beta1/tx';
import { defaultRegistryTypes } from '@cosmjs/stargate';

export const ISCNRegistryTypes: ReadonlyArray<[string, GeneratedType]> = [
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord],
  ['/likechain.iscn.MsgUpdateIscnRecord', MsgUpdateIscnRecord],
  ['/likechain.iscn.MsgChangeIscnRecordOwnership', MsgChangeIscnRecordOwnership],
  ['/likechain.iscn.UpdateAuthorization', UpdateAuthorization],
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
  ['/likechain.likenft.v1.MsgCreateListing', MsgCreateListing],
  ['/likechain.likenft.v1.MsgUpdateListing', MsgUpdateListing],
  ['/likechain.likenft.v1.MsgDeleteListing', MsgDeleteListing],
  ['/likechain.likenft.v1.MsgBuyNFT', MsgBuyNFT],
  ['/likechain.likenft.v1.MsgCreateOffer', MsgCreateOffer],
  ['/likechain.likenft.v1.MsgUpdateOffer', MsgUpdateOffer],
  ['/likechain.likenft.v1.MsgDeleteOffer', MsgDeleteOffer],
  ['/likechain.likenft.v1.MsgSellNFT', MsgSellNFT],
  ['/likechain.likenft.v1.CreateRoyaltyConfigAuthorization', CreateRoyaltyConfigAuthorization],
  ['/likechain.likenft.v1.UpdateRoyaltyConfigAuthorization', UpdateRoyaltyConfigAuthorization],
  ['/likechain.likenft.v1.DeleteRoyaltyConfigAuthorization', DeleteRoyaltyConfigAuthorization],
  ['/likechain.likenft.v1.CreateListingAuthorization', CreateListingAuthorization],
  ['/likechain.likenft.v1.UpdateListingAuthorization', UpdateListingAuthorization],
  ['/likechain.likenft.v1.DeleteListingAuthorization', DeleteListingAuthorization],
  ['/likechain.likenft.v1.CreateOfferAuthorization', CreateOfferAuthorization],
  ['/likechain.likenft.v1.UpdateOfferAuthorization', UpdateOfferAuthorization],
  ['/likechain.likenft.v1.DeleteOfferAuthorization', DeleteOfferAuthorization],
  ['/likechain.likenft.v1.NewClassAuthorization', NewClassAuthorization],
  ['/likechain.likenft.v1.UpdateClassAuthorization', UpdateClassAuthorization],
  ['/likechain.likenft.v1.MintNFTAuthorization', MintNFTAuthorization],
  ['/likechain.likenft.v1.SendNFTAuthorization', SendNFTAuthorization],
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
