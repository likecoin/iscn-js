import { ISCNQueryClient } from './queryClient';

const ISCN_ID = 'iscn://likecoin-chain/dLbKMa8EVO9RF4UmoWKk2ocUq7IsxMcnQL1_Ps5Vg80/1';

describe('queryClient', () => {
  const client = new ISCNQueryClient();

  test('Query ISCN param', async () => {
    const res = await client.queryFeePerByte();
    if (!res) throw new Error('MISSING_RESPONSE');
    expect(Object.keys(res)).toContain('amount');
    expect(res.denom).toEqual('nanolike');
  });

  test('Query ISCN ID by Tx ID', async () => {
    const res = await client.queryISCNIdsByTx('681646B680BC5C6D92C38F361684E2D2115EE9EB0A11D9CBD745A05FBFAF04BD');
    expect(res).toContain(ISCN_ID);
  });

  test('Query ISCN record by ISCN ID', async () => {
    const res = await client.queryRecordsById(ISCN_ID);
    expect(res).toBeTruthy();
    expect(res?.records).toBeTruthy();
    expect(res?.records[0].data.contentMetadata.name).toEqual('A Declaration of the Independence of Cyberspace');
  });

  test('Query ISCN record by Fingerprint', async () => {
    const res = await client.queryRecordsByFingerprint('ipfs://QmPiX4izgDNyJJRnd8V5ei5ce58dsxErpNVre5jcMPBARG');
    expect(res).toBeTruthy();
    expect(res?.records).toBeTruthy();
    expect(res?.records[0].data['@id']).toEqual(ISCN_ID);
  });

  test('Query ISCN record by owner', async () => {
    const res = await client.queryRecordsByOwner('cosmos1sf2sc6t37xhd3m0dcaq6h5dz22mtru2ugdwp0v');
    if (!res) throw new Error('MISSING_RESPONSE');
    expect(res).toBeTruthy();
    expect(res?.records).toBeTruthy();
    expect(res?.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ data: expect.objectContaining({ '@id': ISCN_ID }) }),
      ]),
    );
  });
});
