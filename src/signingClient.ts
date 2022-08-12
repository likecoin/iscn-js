import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject, OfflineSigner } from '@cosmjs/proto-signing';
import {
  SigningStargateClient,
  Coin,
  StdFee,
  DeliverTxResponse,
} from '@cosmjs/stargate';
import { ClassConfig } from '@likecoin/iscn-message-types/dist/likechain/likenft/v1/class_data';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import {
  DEFAULT_RPC_ENDPOINT,
  DEFAULT_GAS_PRICE_NUMBER,
  COSMOS_DENOM,
  ISCN_CHANGE_OWNER_GAS,
  SEND_NFT_GAS,
  LIKENFT_BURN_NFT_GAS,
  GRANT_SEND_AUTH_GAS,
  EXEC_SEND_AUTH_GAS,
  REVOKE_SEND_AUTH_GAS,
} from './constant';
import { ISCNQueryClient } from './queryClient';
import { messageRegistry as registry } from './messages/registry';
import {
  ISCNSignOptions, ISCNSignPayload, MintNFTData, NewNFTClassData,
} from './types';
import {
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
  formatMsgExecSendAuthorization,
  formatMsgGrantSendAuthorization,
  formatMsgRevokeSendAuthorization,
} from './messages/authz';
import signOrBroadcast from './transactions/sign';
import { estimateISCNTxFee, estimateISCNTxGas } from './transactions/iscn';
import { formatGasFee, estimateMsgTxGas, estimateMsgsTxGas } from './transactions/gas';

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

  async fetchISCNFeeDenom(): Promise<void> {
    const feePerByte = await this.queryClient.queryFeePerByte();
    if (feePerByte?.denom) this.denom = feePerByte.denom;
  }

  setDenom(denom: string): void {
    this.denom = denom;
  }

  async esimateISCNTxGasAndFee(
    payload: ISCNSignPayload,
    { gasPrice, memo }: { gasPrice?: number, memo?: string } = {},
  ): Promise<{ gas: { fee: StdFee; }; iscnFee: Coin; }> {
    const [fee, iscnFee] = await Promise.all([
      this.estimateISCNTxGas(payload, { gasPrice, memo }),
      this.estimateISCNTxFee(payload),
    ]);
    return {
      gas: { fee },
      iscnFee,
    };
  }

  async estimateISCNTxFee(
    payload: ISCNSignPayload,
    { version = 1 } = {},
  ): Promise<Coin> {
    return estimateISCNTxFee(this.queryClient, payload, this.denom, { version });
  }

  estimateISCNTxGas(
    payload: ISCNSignPayload,
    { denom = this.denom, gasPrice = DEFAULT_GAS_PRICE_NUMBER, memo }
    : { denom?: string, gasPrice?: number, memo?: string } = {},
  ): StdFee {
    return estimateISCNTxGas(payload, { denom, gasPrice, memo });
  }

  async sendMessages(
    senderAddress: string,
    messages :EncodeObject[],
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = estimateMsgsTxGas(messages, { denom: this.denom, gasPrice, memo });
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
    return response;
  }

  async createISCNRecord(
    senderAddress: string,
    payload: ISCNSignPayload,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [formatMsgCreateIscnRecord(senderAddress, payload)];
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = this.estimateISCNTxGas(payload, { gasPrice, memo });
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    const messages = [formatMsgUpdateIscnRecord(senderAddress, iscnId, payload)];
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = this.estimateISCNTxGas(payload, { gasPrice, memo });
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    const messages = [formatMsgChangeIscnRecordOwnership(senderAddress, iscnId, newOwnerAddress)];
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const fee = inputFee || formatGasFee({
      gas: ISCN_CHANGE_OWNER_GAS,
      gasPrice,
      denom: this.denom,
    });
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
      metadata: nftClassData.metadata,
    };
    const messages = [formatMsgNewClass(
      senderAddress,
      iscnIdPrefix,
      combinedClassData,
      classConfig,
    )];
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = estimateMsgTxGas(messages[0], { denom: this.denom, gasPrice, memo });
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    const messages = [formatMsgUpdateClass(
      senderAddress,
      classId,
      nftClassData,
      classConfig,
    )];
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = estimateMsgTxGas(messages[0], { denom: this.denom, gasPrice, memo });
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    let fee = inputFee;
    if (fee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    if (!fee) {
      const { memo } = signOptions;
      fee = estimateMsgTxGas(
        messages[0],
        {
          denom: this.denom, gasPrice, memo, gasMultiplier: messages.length,
        },
      );
    }
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const fee = inputFee || formatGasFee({
      gas: SEND_NFT_GAS,
      gasPrice,
      gasMultiplier: messages.length,
      denom: this.denom,
    });
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const fee = inputFee || formatGasFee({
      gas: LIKENFT_BURN_NFT_GAS,
      gasPrice,
      gasMultiplier: messages.length,
      denom: this.denom,
    });
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    const messages = [formatMsgGrantSendAuthorization(
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
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
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
    const messages = [formatMsgExecSendAuthorization(
      execAddress,
      granterAddress,
      toAddress,
      amounts,
    )];
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const fee = inputFee || formatGasFee({
      gas: EXEC_SEND_AUTH_GAS,
      gasPrice,
      denom: this.denom,
    });
    const response = await signOrBroadcast(execAddress, messages, fee, client, signOptions);
    return response;
  }

  async revokeSendGrant(
    senderAddress: string,
    granteeAddress: string,
    { fee: inputFee, gasPrice, ...signOptions }: ISCNSignOptions = {},
  ): Promise<TxRaw | DeliverTxResponse> {
    const client = this.signingClient;
    if (!client) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
    const messages = [formatMsgRevokeSendAuthorization(senderAddress, granteeAddress)];
    if (inputFee && gasPrice) throw new Error('CANNOT_SET_BOTH_FEE_AND_GASPRICE');
    const fee = inputFee || formatGasFee({
      gas: REVOKE_SEND_AUTH_GAS,
      gasPrice,
      denom: this.denom,
    });
    const response = await signOrBroadcast(senderAddress, messages, fee, client, signOptions);
    return response;
  }
}

export default ISCNSigningClient;
