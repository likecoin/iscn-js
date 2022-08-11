import { DEFAULT_MESSAGE_GAS, DEFAULT_GAS_PRICE_NUMBER } from '../constant';
import { formatGasFee } from './gas';

describe('formatGasFee', () => {
  test('formatGasFee', async () => {
    const res = formatGasFee({
      denom: 'nanolike',
    });
    expect(res).toEqual(
      expect.objectContaining({
        gas: DEFAULT_MESSAGE_GAS.toString(),
        amount: expect.arrayContaining([expect.objectContaining(
          { amount: (DEFAULT_MESSAGE_GAS * DEFAULT_GAS_PRICE_NUMBER).toString() },
        ), expect.objectContaining(
          { denom: 'nanolike' },
        )]),
      }),
    );
  });

  test('formatGasFee: multiplier', async () => {
    const res = formatGasFee({
      gasMultiplier: 2,
      denom: 'nanolike',
    });
    expect(res).toEqual(
      expect.objectContaining({
        gas: (DEFAULT_MESSAGE_GAS * 2).toString(),
        amount: expect.arrayContaining([expect.objectContaining(
          { amount: (DEFAULT_MESSAGE_GAS * DEFAULT_GAS_PRICE_NUMBER * 2).toString() },
        ), expect.objectContaining(
          { denom: 'nanolike' },
        )]),
      }),
    );
  });

  test('formatGasFee: gas unit', async () => {
    const res = formatGasFee({
      gas: 10000,
      denom: 'nanolike',
    });
    expect(res).toEqual(
      expect.objectContaining({
        gas: '10000',
        amount: expect.arrayContaining([expect.objectContaining(
          { amount: (10000 * DEFAULT_GAS_PRICE_NUMBER).toString() },
        ), expect.objectContaining(
          { denom: 'nanolike' },
        )]),
      }),
    );
  });

  test('formatGasFee: gas price', async () => {
    const res = formatGasFee({
      gasPrice: 1000,
      denom: 'nanolike',
    });
    expect(res).toEqual(
      expect.objectContaining({
        gas: DEFAULT_MESSAGE_GAS.toString(),
        amount: expect.arrayContaining([expect.objectContaining(
          { amount: (DEFAULT_MESSAGE_GAS * 1000).toString() },
        ), expect.objectContaining(
          { denom: 'nanolike' },
        )]),
      }),
    );
  });
});
