import { StdFee } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';
import jsonStringify from 'fast-json-stable-stringify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import {
  GAS_ESTIMATOR_INTERCEPT,
  GAS_ESTIMATOR_SLOPE,
  GAS_ESTIMATOR_BUFFER_RATIO,
  DEFAULT_GAS_PRICE_NUMBER,
  DEFAULT_MESSAGE_GAS,
} from '../constant';

export function formatGasFee({
  gas = DEFAULT_MESSAGE_GAS,
  gasPrice = DEFAULT_GAS_PRICE_NUMBER,
  gasMultiplier = 1,
  denom,
}: {
  gas?: number | string,
  gasPrice?: number | string,
  gasMultiplier?: number | string,
  denom: string,
}): StdFee {
  const fee = {
    amount: [{
      amount: new BigNumber(gas)
        .multipliedBy(gasPrice)
        .multipliedBy(gasMultiplier)
        .toFixed(0, 0),
      denom,
    }],
    gas: new BigNumber(gas).multipliedBy(gasMultiplier).toFixed(0, 0),
  };
  return fee;
}

export function estimateMsgTxGas(msgs: EncodeObject[], {
  denom,
  gasPrice = DEFAULT_GAS_PRICE_NUMBER,
  memo,
}: {
    denom: string,
    gasPrice?: number,
    memo?: string,
  }): StdFee {
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
  const gasUsedEstimationBeforeBuffer = byteSize
    .multipliedBy(GAS_ESTIMATOR_SLOPE)
    .plus(GAS_ESTIMATOR_INTERCEPT);
  const buffer = gasUsedEstimationBeforeBuffer.multipliedBy(GAS_ESTIMATOR_BUFFER_RATIO);
  const gasUsedEstimation = gasUsedEstimationBeforeBuffer.plus(buffer);
  const gas = gasUsedEstimation.toFixed(0, 0);
  return formatGasFee({ gas, gasPrice, denom });
}
