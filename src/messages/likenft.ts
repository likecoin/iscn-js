// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { ClassConfig } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/class_data';
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
        metadata: Buffer.from(JSON.stringify({
          ...(nftClassData.metadata || {}),
        }), 'utf8'),
        config: classConfig || {
          burnable: false,
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
          burnable: false,
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
        metadata: Buffer.from(JSON.stringify({
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
