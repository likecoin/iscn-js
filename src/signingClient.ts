import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject, OfflineSigner } from '@cosmjs/proto-signing';
import {
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  Coin,
  SignerData,
  StdFee,
  DeliverTxResponse,
} from '@cosmjs/stargate';
import { ClassConfig } from '@likecoin/iscn-message-types/dist/likenft/class_data';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { SendAuthorization } from 'cosmjs-types/cosmos/bank/v1beta1/authz';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
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
  SEND_NFT_GAS,
  LIKENFT_MINT_NFT_GAS,
  LIKENFT_CREATE_CLASS_GAS,
  LIKENFT_BURN_NFT_GAS,
  LIKENFT_UPDATE_CLASS_GAS,
  GRANT_SEND_AUTH_GAS,
  EXEC_SEND_AUTH_GAS,
  REVOKE_SEND_AUTH_GAS,
  DEFAULT_MESSAGE_GAS,
} from './constant';
import { ISCNQueryClient } from './queryClient';
import { messageRegistry as registry } from './messages/registry';
import {
  ISCNSignOptions, ISCNSignPayload, MintNFTData, NewNFTClassData,
} from './types';
import {
  formatISCNPayload,
  formatMsgChangeIscnRecordOwnership,
  formatMsgCreateIscnRecord,
  formatMsgUpdateIscnRecord,
} from './messages/iscn';
import {
  formatMsgBurnNFT,
  formatMsgMintNFT,
  formatMsgNewClass,
  formatMsgSend,
  formatMsgUpdateClass,
} from './messages/likenft';
import {
  formatSendAuthorizationMsgExec,
  formatSendAuthorizationMsgGrant,
  formatSendAuthorizationMsgRevoke,
} from './messages/authz';

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
    const msg = formatMsgCreateIscnRecord(STUB_WALLET, payload);
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

  async sendMessages(
    senderAddress: string,
    messages :EncodeObject[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(DEFAULT_MESSAGE_GAS)
            .multipliedBy(messages.length)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: (DEFAULT_MESSAGE_GAS * messages.length).toString(),
      };
    } else if (gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }

  async createISCNRecord(
    senderAddress: string,
    payload: ISCNSignPayload,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const message = formatMsgCreateIscnRecord(senderAddress, payload);
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
    const message = formatMsgUpdateIscnRecord(senderAddress, iscnId, payload);
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
    const message = formatMsgChangeIscnRecordOwnership(senderAddress, iscnId, newOwnerAddress);
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
    const combinedClassData = {
      name: nftClassData.name || contentMetadata.name,
      symbol: nftClassData.symbol,
      description: nftClassData.description || contentMetadata.description,
      uri: nftClassData.uri,
      uriHash: nftClassData.uriHash,
      metadata: {
        ...(contentMetadata || {}),
        ...(nftClassData.metadata || {}),
      },
    };
    const message = formatMsgNewClass(
      senderAddress,
      iscnIdPrefix,
      combinedClassData,
      classConfig,
    );
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
    const message = formatMsgUpdateClass(
      senderAddress,
      classId,
      nftClassData,
      classConfig,
    );
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

  async mintNFTs(
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
    const messages = nftDatas.map((n) => formatMsgMintNFT(senderAddress, classId, n));
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

  async sendNFTs(
    senderAddress: string,
    receiverAddress: string,
    classId: string,
    nftIds: string[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = nftIds.map((id) => formatMsgSend(senderAddress, receiverAddress, classId, id));
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(SEND_NFT_GAS)
            .multipliedBy(nftIds.length)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: (SEND_NFT_GAS * nftIds.length).toString(),
      };
    } else if (gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }

  async burnNFT(
    senderAddress: string,
    classId: string,
    nftIds: string[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = nftIds.map((nftId) => formatMsgBurnNFT(senderAddress, classId, nftId));
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(LIKENFT_BURN_NFT_GAS)
            .multipliedBy(nftIds.length)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: (LIKENFT_BURN_NFT_GAS * nftIds.length).toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }

  async createSendGrant(
    senderAddress: string,
    granteeAddress: string,
    spendLimit: Coin[],
    expirationInMs: number,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [formatSendAuthorizationMsgGrant(
      senderAddress,
      granteeAddress,
      spendLimit,
      expirationInMs,
    )];
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(GRANT_SEND_AUTH_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: GRANT_SEND_AUTH_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }

  async executeSendGrant(
    execAddress: string,
    granterAddress: string,
    toAddress: string,
    amounts: Coin[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [formatSendAuthorizationMsgExec(
      execAddress,
      granterAddress,
      toAddress,
      amounts,
    )];
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(EXEC_SEND_AUTH_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: EXEC_SEND_AUTH_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(execAddress, messages, fee, signOptions);
    return response;
  }

  async revokeSendGrant(
    senderAddress: string,
    granteeAddress: string,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [formatSendAuthorizationMsgRevoke(senderAddress, granteeAddress)];
    let fee = inputFee;
    if (!fee) {
      fee = {
        amount: [{
          amount: new BigNumber(REVOKE_SEND_AUTH_GAS)
            .multipliedBy(gasPrice || DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
          denom: this.denom,
        }],
        gas: REVOKE_SEND_AUTH_GAS.toString(),
      };
    } else if (gasPrice) {
      throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    }
    const response = await this.signOrBroadcast(senderAddress, messages, fee, signOptions);
    return response;
  }
}

export default ISCNSigningClient;
