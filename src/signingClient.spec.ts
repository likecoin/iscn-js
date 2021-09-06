import { ISCNSigningClient } from './signingClient';
import testData from './tests/iscn-sample-1.json';

describe('queryClient', () => {
  const client = new ISCNSigningClient();

  test('Estimate ISCN gas and fee', async () => {
    const res = await client.esimateISCNTxGasAndFee(testData);
    expect(res).toEqual(
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '185878' }) }) }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2744000' }) }),
    );
  });
});
