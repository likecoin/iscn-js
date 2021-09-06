import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner, Registry } from '@cosmjs/proto-signing';
import {
  defaultRegistryTypes,
  assertIsBroadcastTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate';
import {
  MsgCreateIscnRecord,
  MsgUpdateIscnRecord,
  MsgChangeIscnRecordOwnership,
} from '@likecoin/iscn-message-types/dist/iscn/tx';
import jsonStringify from 'fast-json-stable-stringify';

import {
  ISCN_REGISTRY_NAME,
  GAS_ESTIMATOR_INTERCEPT,
  GAS_ESTIMATOR_BUFFER,
  GAS_ESTIMATOR_SLOP,
  DEFAULT_GAS_PRICE_NUMBER,
  COSMOS_DENOM,
  STUB_WALLET,
  ISCN_CHANGE_OWNER_GAS,
} from './constant';
import { ISCNQueryClient } from './queryClient';
import { ISCNSignPayload, Stakeholder } from './types';

const registry = new Registry([
  ...defaultRegistryTypes,
  ['/likechain.iscn.MsgCreateIscnRecord', MsgCreateIscnRecord],
  ['/likechain.iscn.MsgUpdateIscnRecord', MsgUpdateIscnRecord],
  ['/likechain.iscn.MsgChangeIscnRecordOwnership', MsgChangeIscnRecordOwnership],
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
  };
  return {
    recordNotes,
    contentFingerprints,
    stakeholders,
    contentMetadata: Buffer.from(JSON.stringify(contentMetadata), 'utf8'),
  };
}

export async function estimateISCNTxGas(tx: ISCNSignPayload) {
  const record = await formatISCNPayload(tx);
  const msg = {
    type: Buffer.from('likecoin-chain/MsgCreateIscnRecord', 'utf-8'),
    value: {
      from: Buffer.from(STUB_WALLET, 'utf-8'),
      record,
    },
  };
  const value = {
    msg: [msg],
    fee: {
      amount: [{
        denom: 'nanolike',
        amount: '200000', // temp number here for estimation
      }],
      gas: '200000', // temp number here for estimation
    },
  };
  const obj = {
    type: 'cosmos-sdk/StdTx',
    value: Buffer.from(jsonStringify(value), 'utf-8'),
  };
  const interceptWithBuffer = new BigNumber(GAS_ESTIMATOR_INTERCEPT).plus(GAS_ESTIMATOR_BUFFER);
  const txBytes = Buffer.from(jsonStringify(obj), 'utf-8');
  const byteSize = new BigNumber(txBytes.length);
  const gasUsedEstimation = byteSize.multipliedBy(GAS_ESTIMATOR_SLOP).plus(interceptWithBuffer);
  return {
    fee: {
      amount: [{
        amount: gasUsedEstimation.multipliedBy(DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
        denom: COSMOS_DENOM,
      }],
      gas: gasUsedEstimation.toFixed(0, 0),
    },
  };
}

export class ISCNSigningClient {
  signingClient: SigningStargateClient | null = null;

  queryClient: ISCNQueryClient;

  constructor() {
    this.queryClient = new ISCNQueryClient();
  }

  async connectWithSigner(rpcURL: string, signer: OfflineSigner) {
    this.signingClient = await SigningStargateClient.connectWithSigner(
      rpcURL,
      signer,
      { registry },
    );
    await this.queryClient.connect(rpcURL);
  }

  async estimateISCNTxFee(
    tx: ISCNSignPayload,
    { version = 1 } = {},
  ) {
    const record = formatISCNPayload(tx);
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
      + stakeholders.reduce((acc, s) => acc + s.length, 0)
      + contentMetadata.length;
    const feeAmount = byteSize * feePerByteAmount;
    return feeAmount;
  }

  async createISCNRecord(
    senderAddress: string,
    payload: ISCNSignPayload,
    { memo }: { memo?: string} = {},
  ) {
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
    const { fee } = await estimateISCNTxGas(payload);
    const response = await client.signAndBroadcast(senderAddress, [message], fee, memo);
    assertIsBroadcastTxSuccess(response);
    return response;
  }

  async updateISCNRecord(
    senderAddress: string,
    iscnId: string,
    payload: ISCNSignPayload,
    { memo }: { memo?: string} = {},
  ) {
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
    const { fee } = await estimateISCNTxGas(payload);
    const response = await client.signAndBroadcast(senderAddress, [message], fee, memo);
    assertIsBroadcastTxSuccess(response);
    return response;
  }

  async changeISCNOwnership(
    senderAddress: string,
    newOwnerAddress: string,
    iscnId: string,
    { memo }: { memo?: string} = {},
  ) {
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
    const fee = {
      amount: [{
        amount: new BigNumber(ISCN_CHANGE_OWNER_GAS)
          .multipliedBy(DEFAULT_GAS_PRICE_NUMBER).toFixed(0, 0),
        denom: COSMOS_DENOM,
      }],
      gas: ISCN_CHANGE_OWNER_GAS.toString(),
    };
    const response = await client.signAndBroadcast(senderAddress, [message], fee, memo);
    assertIsBroadcastTxSuccess(response);
    return response;
  }
}
