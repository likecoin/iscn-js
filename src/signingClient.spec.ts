import { ISCNSigningClient } from './signingClient';
import testData1 from './tests/iscn-sample-1.json';
import testData2 from './tests/iscn-sample-2.json';

describe('queryClient', () => {
  const client = new ISCNSigningClient();

  test('Estimate ISCN gas and fee', async () => {
    const res = await client.esimateISCNTxGasAndFee(testData1);
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '169847',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '169847000' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2744000' }) }),
    );
  });

  test('Estimate large ISCN gas and fee', async () => {
    const res = await client.esimateISCNTxGasAndFee(testData2);
    expect(res).toEqual(
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '248124' }) }) }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '5848000' }) }),
    );
  });


  test('Estimate ISCN gas with custom gas price', async () => {
    const res = await client.esimateISCNTxGasAndFee(testData1, { gasPrice: 1 });
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '169847',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '169847' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2744000' }) }),
    );
  });
});
