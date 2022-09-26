import { getStakeholderMap } from './stakeholderRatioCalculation';

describe('stakeholderRatioCalculation', () => {
  test('stakeholderRatioCalculation testnet totalLIKE100', async () => {
    const res = await getStakeholderMap('iscn://likecoin-chain/25L-03N8vJCLZOypQUYsjYd4ZbI6iRPUxFynm31mGQU/1', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 100, likerId: 'testforkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation testnet no totalLIKE', async () => {
    const res = await getStakeholderMap('iscn://likecoin-chain/25L-03N8vJCLZOypQUYsjYd4ZbI6iRPUxFynm31mGQU/1', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    const LIKEMap = new Map();
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 1, likerId: 'testforkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet totalLIKE100', async () => {
    const res = await getStakeholderMap('iscn://likecoin-chain/LYVNpAnfZ89VDkWP1C3w4VhjlzSvQE3OCI7ufbmCA_0/1', { LIKE_CO_API_ROOT: 'https://api.like.co', totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 100, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet no totalLIKE', async () => {
    const res = await getStakeholderMap('iscn://likecoin-chain/LYVNpAnfZ89VDkWP1C3w4VhjlzSvQE3OCI7ufbmCA_0/1', { LIKE_CO_API_ROOT: 'https://api.like.co' });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 1, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet (no need LIKE_CO_API_ROOT)', async () => {
    const res = await getStakeholderMap('iscn://likecoin-chain/LYVNpAnfZ89VDkWP1C3w4VhjlzSvQE3OCI7ufbmCA_0/1', { totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 100, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation testnet iscn error', async () => {
    try {
      await getStakeholderMap('iscn://likecoin-chain/xxxxxxxxxxx/1', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalLIKE: 100 });
    } catch (error) {
      expect(error).toEqual(new Error('ISCN with ID iscn://likecoin-chain/xxxxxxxxxxx/1 not found'));
    }
  });
});
