import { StdFee } from '@cosmjs/stargate';
import BigNumber from 'bignumber.js';
import { DEFAULT_GAS_PRICE_NUMBER, DEFAULT_MESSAGE_GAS } from '../constant';

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

export default formatGasFee;
