import jsonStringify from 'fast-json-stable-stringify';
import BigNumber from 'bignumber.js';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { Buffer } from 'buffer/';

import { formatGasFee } from './gas';
import ISCNQueryClient from '../queryClient';

export async function estimateNFTTxFee(
  queryClient: ISCNQueryClient,
  msgs: EncodeObject[],
  denom: string,
  memo?: string,
): Promise<Coin> {
  const feePerByte = await queryClient.queryNFTFeePerByte();
  const feePerByteAmount = feePerByte ? parseInt(feePerByte.amount, 10) : 1;
  const value = {
    msg: msgs,
    // temp number here for estimation
    fee: formatGasFee({ gas: '200000', gasPrice: '1', denom }),
  };
  const obj = {
    type: 'cosmos-sdk/StdTx',
    value,
    memo, // directly append memo to object if exists, since we only need its length
  };
  const txBytes = Buffer.from(jsonStringify(obj), 'utf-8');
  const byteSize = new BigNumber(txBytes.length);
  const feeAmount = new BigNumber(byteSize).multipliedBy(feePerByteAmount);
  return {
    amount: feeAmount.toFixed(0, 0),
    denom: feePerByte?.denom || denom,
  } as Coin;
}

export default estimateNFTTxFee;
