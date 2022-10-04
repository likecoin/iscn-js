import axios from 'axios';
import { getLikeWalletByLikerId, getLikerIdByWallet } from './likerIdsAddresses';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('likerIdsAddresses', () => {
  test('getLikeWalletByLikerId testnet', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'kuan85998',
        displayName: 'kuan85998',
        avatar: 'https://static.like.co/likecoin_de-portrait.jpg',
        cosmosWallet: 'cosmos1twr950vdy4gr9aggq5lehden8m023e0aj26kpe',
        likeWallet: 'like1twr950vdy4gr9aggq5lehden8m023e0apkx5zz',
      },
    }));
    const res = await getLikeWalletByLikerId('kuan85998');
    expect(res).toEqual('like1twr950vdy4gr9aggq5lehden8m023e0apkx5zz');
  });

  test('getLikeWalletByLikerId testnet not found', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('error'));
    try {
      await getLikeWalletByLikerId('noThisLiker', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    } catch (error) {
      expect(error).toEqual(new Error('error'));
    }
  });

  test('getLikeWalletByLikerId mainnet', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'hsuehkuan',
        displayName: 'hsuehkuan',
        avatar: 'https://static.like.co/likecoin_de-portrait.jpg',
        cosmosWallet: 'cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz',
        likeWallet: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
      },
    }));
    const res = await getLikeWalletByLikerId('hsuehkuan', { LIKE_CO_API_ROOT: 'https://api.like.co' });
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikeWalletByLikerId mainnet not found', async () => {
    mockedAxios.get.mockRejectedValue(new Error('error'));
    try {
      await getLikeWalletByLikerId('noThisLiker', { LIKE_CO_API_ROOT: 'https://api.like.co' });
    } catch (error) {
      expect(error).toEqual(new Error('error'));
    }
  });

  test('getLikeWalletByLikerId mainnet (no need LIKE_CO_API_ROOT)', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'hsuehkuan',
        displayName: 'hsuehkuan',
        avatar: 'https://static.like.co/likecoin_de-portrait.jpg',
        cosmosWallet: 'cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz',
        likeWallet: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
      },
    }));
    const res = await getLikeWalletByLikerId('hsuehkuan');
    expect(res).toEqual('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
  });

  test('getLikerIdByWallet testnet', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'hsuehkuan',
        displayName: 'hsuehkuan',
        avatar: 'https://storage.googleapis.com/likecoin-develop.appspot.com/likecoin_store_user_hsuehkuan_test?GoogleAccessId=firebase-adminsdk-b93f2%40likecoin-develop.iam.gserviceaccount.com&Expires=2430432000&Signature=K%2BlHuIBgjF%2B7bwgdNXHwGUtorInBEXkBrBAplyfrt6KuWzZi2tnH6LwCgoOQXJk1DNDQ4u64Ezb0buvT6H5DfUIxqN7qaInmNU7Pq7%2Bmd7orTV1cNHESLbO1nLWLNSm4tCUwXv8QYj1LaZ0qH218lxIfTSt6LEduOlH%2BV6b3LrVYi1o3j%2FIT0a9dG2MAgCuj4%2FMY2C%2BDsyVFSwGU1pCG03BDSU8fInawfeCg6jzGv3CDIBdvkn1sK54Hk4jofEAF%2BxmZrqvQVChF7HIrOujeYQbXxANTwWQmvj3B7%2FhyBwtsp2eJ4vcrmkjlHOey0KOsjtQbUnH3zE5N1R%2Fv%2BtZhMw%3D%3D&faee9bb',
        cosmosWallet: 'cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz',
        likeWallet: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
        isSubscribedCivicLiker: true,
        civicLikerSince: 1649933818906,
      },
    }));
    const res = await getLikerIdByWallet('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    expect(res).toEqual('hsuehkuan');
  });

  test('getLikerIdByWallet testnet not found', async () => {
    mockedAxios.get.mockRejectedValue(new Error('error'));
    try {
      await getLikerIdByWallet('noThisLiker', { LIKE_CO_API_ROOT: 'https://api.like.co' });
    } catch (error) {
      expect(error).toEqual(new Error('error'));
    }
  });

  test('getLikerIdByWallet mainnet', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'hsuehkuan',
        displayName: 'hsuehkuan',
        avatar: 'https://static.like.co/likecoin_de-portrait.jpg',
        cosmosWallet: 'cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz',
        likeWallet: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
      },
    }));
    const res = await getLikerIdByWallet('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    expect(res).toEqual('hsuehkuan');
  });

  test('getLikerIdByWallet mainnet not found', async () => {
    mockedAxios.get.mockRejectedValue(new Error('error'));
    try {
      await getLikerIdByWallet('noThisLiker', { LIKE_CO_API_ROOT: 'https://api.like.co' });
    } catch (error) {
      expect(error).toEqual(new Error('error'));
    }
  });

  test('getLikerIdByWallet mainnet (no need LIKE_CO_API_ROOT)', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({
      data: {
        user: 'hsuehkuan',
        displayName: 'hsuehkuan',
        avatar: 'https://static.like.co/likecoin_de-portrait.jpg',
        cosmosWallet: 'cosmos156gedr03g3ggwktzhygfusax4df46k8dyxjdcz',
        likeWallet: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
      },
    }));
    const res = await getLikerIdByWallet('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me');
    expect(res).toEqual('hsuehkuan');
  });
});
