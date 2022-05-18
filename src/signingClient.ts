import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject, OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  Coin,
  SignerData,
  StdFee,
  DeliverTxResponse,
} from '@cosmjs/stargate';
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
import { ClassConfig } from '@likecoin/iscn-message-types/dist/likenft/class_data';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import jsonStringify from 'fast-json-stable-stringify';

import {
  ISCN_REGISTRY_NAME,
  GAS_ESTIMATOR_INTERCEPT,
  GAS_ESTIMATOR_SLOPE,
  GAS_ESTIMATOR_BUFFER_RATIO,
  DEFAULT_RPC_ENDPOINT,
  DEFAULT_GAS_PRICE_NUMBER,
  COSMOS_DENOM,
  STUB_WALLET,
  ISCN_CHANGE_OWNER_GAS,
  LIKENFT_MINT_NFT_GAS,
  LIKENFT_CREATE_CLASS_GAS,
  LIKENFT_BURN_NFT_GAS,
  LIKENFT_UPDATE_CLASS_GAS,
} from './constant';
import { ISCNQueryClient } from './queryClient';
import { ISCNSignOptions, ISCNSignPayload, MintNFTData, NewNFTClassData, Stakeholder } from './types';


const registry = new Registry([
  ...defaultRegistryTypes,
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord],
  ['/likechain.iscn.MsgUpdateIscnRecord', MsgUpdateIscnRecord],
  ['/likechain.iscn.MsgChangeIscnRecordOwnership', MsgChangeIscnRecordOwnership],
  ['/likechain.likenft.MsgNewClass', MsgNewClass],
  ['/likechain.likenft.MsgUpdateClass', MsgUpdateClass],
  ['/likechain.likenft.MsgMintNFT', MsgMintNFT],
  ['/likechain.likenft.MsgBurnNFT', MsgBurnNFT],
  ['/likechain.likenft.MsgCreateMintableNFT', MsgCreateMintableNFT],
  ['/likechain.likenft.MsgUpdateMintableNFT', MsgUpdateMintableNFT],
  ['/likechain.likenft.MsgDeleteMintableNFT', MsgDeleteMintableNFT],
]);

export function formatISCNPayload(payload: ISCNSignPayload, version = 1) {
  if (!payload) throw new Error('INVALID_ISCN_PAYLOAD');
  const {
    name,
    description,
    keywords = [],
    url,
    contentFingerprints,
    stakeholders: inputStakeHolders = [],
    type,
    usageInfo,
    recordNotes,
    ...data
  } = payload;

  const stakeholders = inputStakeHolders.map((s: Stakeholder) => Buffer.from(
    JSON.stringify(s),
    'utf8',
  ));
  const contentMetadata = {
    '@context': 'http://schema.org/',
    '@type': type,
    name,
    description,
    version,
    url,
    keywords: keywords.join(','),
    usageInfo,
    ...data,
  };
  return {
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  };
}

export class ISCNSigningClient {
  private signingClient: SigningStargateClient | null = null;

  private queryClient: ISCNQueryClient;

  private rpcURL = DEFAULT_RPC_ENDPOINT;

  private denom = COSMOS_DENOM;

  constructor() {
    this.queryClient = new ISCNQueryClient();
  }

  getSigningStargateClient(): SigningStargateClient | null {
    return this.signingClient;
  }

  getISCNQueryClient(): ISCNQueryClient {
    return this.queryClient;
  }

  async connect(rpcURL: string): Promise<void> {
    await this.queryClient.connect(rpcURL);
    this.rpcURL = rpcURL;
    await this.fetchISCNFeeDenom();
  }

  async setSigner(signer: OfflineSigner): Promise<void> {
    this.signingClient = await SigningStargateClient.connectWithSigner(
      this.rpcURL,
      signer,
      { registry },
    );
  }

  async connectWithSigner(rpcURL: string, signer: OfflineSigner): Promise<void> {
    await this.connect(rpcURL);
    await this.setSigner(signer);
  }

  async fetchISCNFeeDenom() {
    const feePerByte = await this.queryClient.queryFeePerByte();
    if (feePerByte?.denom) this.denom = feePerByte.denom;
  }

  setDenom(denom: string): void {
    this.denom = denom;
  }

  async esimateISCNTxGasAndFee(
    payload: ISCNSignPayload,
    { gasPrice, memo }: { gasPrice?: number, memo?: string } = {},
  ) {
    const [gas, iscnFee] = await Promise.all([
      this.estimateISCNTxGas(payload, { gasPrice, memo }),
      this.estimateISCNTxFee(payload),
    ]);
    return {
      gas,
      iscnFee,
    };
  }

  async estimateISCNTxFee(
    payload: ISCNSignPayload,
    { version = 1 } = {},
  ) {
    const record = formatISCNPayload(payload);
    const feePerByte = await this.queryClient.queryFeePerByte();
    const feePerByteAmount = feePerByte ? parseInt(feePerByte.amount, 10) : 1;
    const {
      recordNotes,
      contentFingerprints,
      stakeholders,
      contentMetadata,
    } = record;
    const now = new Date();
    const obj = {
      '@context': {
        '@vocab': 'http://iscn.io/',
        recordParentIPLD: {
          '@container': '@index',
        },
        stakeholders: {
          '@context': {
            '@vocab': 'http://schema.org/',
            entity: 'http://iscn.io/entity',
            rewardProportion: 'http://iscn.io/rewardProportion',
            contributionType: 'http://iscn.io/contributionType',
            footprint: 'http://iscn.io/footprint',
          },
        },
        contentMetadata: {
          '@context': null,
        },
      },
      '@type': 'Record',
      '@id': `iscn://${ISCN_REGISTRY_NAME}/btC7CJvMm4WLj9Tau9LAPTfGK7sfymTJW7ORcFdruCU/1`,
      recordTimestamp: now.toISOString(),
      recordVersion: version,
      recordNotes,
      contentFingerprints,
      recordParentIPLD: {},
    };
    if (version > 1) {
      obj.recordParentIPLD = {
        '/': 'bahuaierav3bfvm4ytx7gvn4yqeu4piiocuvtvdpyyb5f6moxniwemae4tjyq',
      };
    }
    const byteSize = Buffer.from(jsonStringify(obj), 'utf-8').length
      + Buffer.from(jsonStringify({ stakeholders: [], contentMetadata: {} }), 'utf-8').length
      + stakeholders.reduce((acc, s) => acc + s.length, 0)
      + stakeholders.length
      + contentMetadata.length;
    const feeAmount = new BigNumber(byteSize).multipliedBy(feePerByteAmount);
    return {
      amount: feeAmount.toFixed(0, 0),
      denom: feePerByte?.denom || this.denom,
    } as Coin;
  }

  async estimateISCNTxGas(payload: ISCNSignPayload, {
    denom = this.denom,
    gasPrice = DEFAULT_GAS_PRICE_NUMBER,
    memo,
  }: {
    denom?: string,
    gasPrice?: number,
    memo?: string,
  } = {}) {
    const record = await formatISCNPayload(payload);
    const msg = {
      type: 'likecoin-chain/MsgCreateIscnRecord',
      value: {
        from: STUB_WALLET,
        record,
      },
    };
    const value = {
      msg: [msg],
      fee: {
        amount: [{
          denom,
          amount: '200000', // temp number here for estimation
        }],
        gas: '200000', // temp number here for estimation
      },
    };
    const obj = {
      type: 'cosmos-sdk/StdTx',
      value,
      memo, // directly append memo to object if exists, since we only need its length
    };
    const txBytes = Buffer.from(jsonStringify(obj), 'utf-8');
    const byteSize = new BigNumber(txBytes.length);
    const gasUsedEstimationBeforeBuffer = byteSize
      .multipliedBy(GAS_ESTIMATOR_SLOPE)
      .plus(GAS_ESTIMATOR_INTERCEPT);
    const buffer = gasUsedEstimationBeforeBuffer.multipliedBy(GAS_ESTIMATOR_BUFFER_RATIO);
    const gasUsedEstimation = gasUsedEstimationBeforeBuffer.plus(buffer);
    const gas = gasUsedEstimation.toFixed(0, 0);
    return {
      fee: {
        amount: [{
          amount: new BigNumber(gas)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom,
        }],
        gas,
      },
    };
  }

  private async signOrBroadcast(
    senderAddress: string,
    messages: EncodeObject[],
    fee: StdFee,
    {
      memo = '',
      broadcast = true,
      accountNumber,
      sequence,
      chainId,
    }: ISCNSignOptions = {},
  ) {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    let signData: SignerData | undefined;
    if ((accountNumber !== undefined || sequence !== undefined || chainId !== undefined)) {
      if (!(accountNumber !== undefined && sequence !== undefined && chainId !== undefined)) {
        throw new Error('MUST_DEFINE_ALL_SIGNING_PARAM');
      }
      signData = {
        accountNumber,
        sequence,
        chainId,
      };
    }
    const txRaw = await client.sign(senderAddress, messages, fee, memo, signData);
    if (!broadcast) {
      return txRaw;
    }
    const txBytes = TxRaw.encode(txRaw).finish();
    const response = await client.broadcastTx(txBytes);
    assertIsDeliverTxSuccess(response);
    return response;
  }

  async createISCNRecord(
    senderAddress: string,
    payload: ISCNSignPayload,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const record = formatISCNPayload(payload);
    const message = {
      typeUrl: '/likechain.iscn.MsgCreateIscnRecord',
      value: {
        from: senderAddress,
        record,
      },
    };
    let fee = inputFee;
    if (!fee) {
      const { memo } = signOptions;
      ({ fee } = await this.estimateISCNTxGas(payload, { gasPrice, memo }));
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, [message], fee, signOptions);
    return response;
  }

  async updateISCNRecord(
    senderAddress: string,
    iscnId: string,
    payload: ISCNSignPayload,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const record = formatISCNPayload(payload);
    const message = {
      typeUrl: '/likechain.iscn.MsgUpdateIscnRecord',
      value: {
        from: senderAddress,
        iscnId,
        record,
      },
    };
    let fee = inputFee;
    if (!fee) {
      const { memo } = signOptions;
      ({ fee } = await this.estimateISCNTxGas(payload, { gasPrice, memo }));
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, [message], fee, signOptions);
    return response;
  }

  async changeISCNOwnership(
    senderAddress: string,
    newOwnerAddress: string,
    iscnId: string,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const message = {
      typeUrl: '/likechain.iscn.MsgChangeIscnRecordOwnership',
      value: {
        from: senderAddress,
        iscnId,
        newOwner: newOwnerAddress,
      },
    };
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(ISCN_CHANGE_OWNER_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: ISCN_CHANGE_OWNER_GAS.toString(),
      };
    } else if (gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const response = await this.signOrBroadcast(senderAddress, [message], fee, signOptions);
    return response;
  }

  async createNFTClass(
    senderAddress: string,
    iscnIdPrefix: string,
    nftClassData: NewNFTClassData,
    classConfig?: ClassConfig,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const res = await this.queryClient.queryRecordsById(iscnIdPrefix);
    if (!res) throw new Error('ISCN_NOT_FOUND');
    const { records: [record] } = res;
    const { data: { contentMetadata } } = record;
    const message = {
      typeUrl: '/likechain.likenft.MsgNewClass',
      value: {
        creator: senderAddress,
        parent: {
          type: 1, // ISCN
          iscnIdPrefix,
        },
        input: {
          name: nftClassData.name || contentMetadata.name,
          symbol: nftClassData.symbol,
          description: nftClassData.description || contentMetadata.description,
          uri: nftClassData.uri,
          uriHash: nftClassData.uriHash,
          metadata: {
            ...(contentMetadata || {}),
            ...(nftClassData.metadata || {}),
          },
          config: classConfig || {
            burnable: false,
          },
        },
      },
    };
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(LIKENFT_CREATE_CLASS_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: LIKENFT_CREATE_CLASS_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, [message], fee, signOptions);
    return response;
  }

  async updateNFTClass(
    senderAddress: string,
    classId: string,
    nftClassData: NewNFTClassData,
    classConfig?: ClassConfig,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const message = {
      typeUrl: '/likechain.likenft.MsgUpdateClass',
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
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(LIKENFT_UPDATE_CLASS_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: LIKENFT_UPDATE_CLASS_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, [message], fee, signOptions);
    return response;
  }

  async mintNFT(
    senderAddress: string,
    classId: string,
    nftDatas: MintNFTData[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const query = await this.queryClient.getQueryClient();
    const res = await query.nft.class(classId);
    if (!res || !res.class) throw new Error('Class not found');
    const classData = res.class;
    const messages = nftDatas.map((n) => ({
      typeUrl: '/likechain.likenft.MsgMintNFT',
      value: {
        creator: senderAddress,
        classId,
        id: n.id,
        input: {
          uri: n.uri,
          uriHash: n.uriHash,
          metadata: {
            name: classData.name,
            description: classData.description,
            ...(classData.data || {}),
            ...(n.metadata || {}),
          },
        },
      },
    }));
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(LIKENFT_MINT_NFT_GAS)
            .multipliedBy(nftDatas.length)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: (LIKENFT_MINT_NFT_GAS * nftDatas.length).toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }

  async burnNFT(
    senderAddress: string,
    classId: string,
    nftId: string,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [{
      typeUrl: '/likechain.likenft.MsgBurnNFT',
      value: {
        creator: senderAddress,
        classId,
        nftId,
      },
    }];
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(LIKENFT_BURN_NFT_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: LIKENFT_BURN_NFT_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }
}
