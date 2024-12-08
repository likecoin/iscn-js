// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { ClassConfig } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/class_data';
import { RoyaltyConfigInput } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/royalty_config';
// eslint-disable-next-line import/no-extraneous-dependencies
import Long from 'long';
import globalThis from '../globalThis';
import { MintNFTData, NewNFTClassData } from '../types';

export function formatMsgNewClass(
  senderAddress: string,
  iscnIdPrefix: string,
  nftClassData: NewNFTClassData,
  classConfig?: ClassConfig,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgNewClass',
    value: {
      creator: senderAddress,
      parent: {
        type: 1, // ISCN
        iscnIdPrefix,
      },
      input: {
        name: nftClassData.name,
        symbol: nftClassData.symbol,
        description: nftClassData.description,
        uri: nftClassData.uri,
        uriHash: nftClassData.uriHash,
        metadata: globalThis.Buffer.from(JSON.stringify({
          ...(nftClassData.metadata || {}),
        }), 'utf8'),
        config: classConfig || {
          burnable: true,
        },
      },
    },
  };
  return message;
}

export function formatMsgUpdateClass(
  senderAddress: string,
  classId: string,
  nftClassData: NewNFTClassData,
  classConfig?: ClassConfig,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgUpdateClass',
    value: {
      creator: senderAddress,
      classId,
      input: {
        ...nftClassData,
        config: classConfig || {
          burnable: true,
        },
      },
    },
  };
  return message;
}

export function formatMsgMintNFT(
  senderAddress: string,
  classId: string,
  nftData: MintNFTData,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgMintNFT',
    value: {
      creator: senderAddress,
      classId,
      id: nftData.id,
      input: {
        uri: nftData.uri,
        uriHash: nftData.uriHash,
        metadata: globalThis.Buffer.from(JSON.stringify({
          ...(nftData.metadata || {}),
        }), 'utf8'),
      },
    },
  };
  return message;
}

export function formatMsgSend(
  senderAddress: string,
  receiverAddress: string,
  classId: string,
  nftId: string,
): EncodeObject {
  const message = {
    typeUrl: '/cosmos.nft.v1beta1.MsgSend',
    value: {
      sender: senderAddress,
      receiver: receiverAddress,
      classId,
      id: nftId,
    },
  };
  return message;
}

export function formatMsgBurnNFT(
  senderAddress: string,
  classId: string,
  nftId: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgBurnNFT',
    value: {
      creator: senderAddress,
      classId,
      nftId,
    },
  };
  return message;
}

export function formatMsgCreateRoyaltyConfig(
  senderAddress: string,
  classId: string,
  royaltyConfig: RoyaltyConfigInput,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgCreateRoyaltyConfig',
    value: {
      creator: senderAddress,
      classId,
      royaltyConfig,
    },
  };
  return message;
}

export function formatMsgUpdateRoyaltyConfig(
  senderAddress: string,
  classId: string,
  royaltyConfig: RoyaltyConfigInput,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgUpdateRoyaltyConfig',
    value: {
      creator: senderAddress,
      classId,
      royaltyConfig,
    },
  };
  return message;
}

export function formatMsgDeleteRoyaltyConfig(
  senderAddress: string,
  classId: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgDeleteRoyaltyConfig',
    value: {
      creator: senderAddress,
      classId,
    },
  };
  return message;
}

export function formatMsgCreateListing(
  senderAddress: string,
  classId: string,
  nftId: string,
  price: string,
  expiration?: number,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgCreateListing',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      price: Long.fromString(price),
      expiration: expiration ? new Date(expiration) : new Date(Date.now() + 86400 * 180),
    },
  };
  return message;
}

export function formatMsgUpdateListing(
  senderAddress: string,
  classId: string,
  nftId: string,
  price: string,
  expiration?: number,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgUpdateListing',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      price: Long.fromString(price),
      expiration: expiration ? new Date(expiration) : new Date(Date.now() + 86400 * 180),
    },
  };
  return message;
}

export function formatMsgDeleteListing(
  senderAddress: string,
  classId: string,
  nftId: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgDeleteListing',
    value: {
      creator: senderAddress,
      classId,
      nftId,
    },
  };
  return message;
}

export function formatMsgBuyNFT(
  senderAddress: string,
  classId: string,
  nftId: string,
  seller: string,
  price: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgBuyNFT',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      seller,
      price: Long.fromString(price),
    },
  };
  return message;
}

export function formatMsgCreateOffer(
  senderAddress: string,
  classId: string,
  nftId: string,
  price: string,
  expiration?: number,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgCreateOffer',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      price: Long.fromString(price),
      expiration: expiration ? new Date(expiration) : new Date(Date.now() + 86400 * 180),
    },
  };
  return message;
}

export function formatMsgUpdateOffer(
  senderAddress: string,
  classId: string,
  nftId: string,
  price: string,
  expiration?: number,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgUpdateOffer',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      price: Long.fromString(price),
      expiration: expiration ? new Date(expiration) : new Date(Date.now() + 86400 * 180),
    },
  };
  return message;
}

export function formatMsgDeleteOffer(
  senderAddress: string,
  classId: string,
  nftId: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgDeleteOffer',
    value: {
      creator: senderAddress,
      classId,
      nftId,
    },
  };
  return message;
}

export function formatMsgSellNFT(
  senderAddress: string,
  classId: string,
  nftId: string,
  buyer: string,
  price: string,
): EncodeObject {
  const message = {
    typeUrl: '/likechain.likenft.v1.MsgSellNFT',
    value: {
      creator: senderAddress,
      classId,
      nftId,
      buyer,
      price: Long.fromString(price),
    },
  };
  return message;
}
