import { calculateStakeholderRewards, parseStakeholderAddresses, parseAndCalculateStakeholderRewards } from './parsing';

const iscnDataTestnet = {
  '@context': {
    '@vocab': 'http://iscn.io/',
    contentMetadata: { '@context': null },
    recordParentIPLD: { '@container': '@index' },
    stakeholders: {
      '@context': {
        '@vocab': 'http://schema.org/',
        contributionType: 'http://iscn.io/contributionType',
        entity: 'http://iscn.io/entity',
        footprint: 'http://iscn.io/footprint',
        rewardProportion: 'http://iscn.io/rewardProportion',
      },
    },
  },
  '@id': 'iscn://likecoin-chain/25L-03N8vJCLZOypQUYsjYd4ZbI6iRPUxFynm31mGQU/1',
  '@type': 'Record',
  contentFingerprints: [],
  contentMetadata: {
    '@context': 'http://schema.org/',
    '@type': 'Article',
    description: 'Launch of LikeCoin Airdrop The long-awaited 50 million...',
    keywords: 'Airdrop,Civic Liker,Depub,LikeCoin,Progress Update',
    usageInfo: '',
    version: 1,
  },
  recordNotes: '',
  recordTimestamp: '2022-05-04T14:32:38+00:00',
  recordVersion: 1,
  stakeholders: [
    {
      contributionType: 'http://schema.org/author',
      entity: {
        '@id': 'did:cosmos:1tej2qstg4q255s620ld74gyvw0nzhklu5p9qq0',
        name: 'likecoin',
      },
      rewardProportion: 1,
    },
  ],
};

const iscnDataTestnet2 = {
  '@context': {
    '@vocab': 'http://iscn.io/',
    contentMetadata: { '@context': null },
    recordParentIPLD: { '@container': '@index' },
    stakeholders: {
      '@context': {
        '@vocab': 'http://schema.org/',
        contributionType: 'http://iscn.io/contributionType',
        entity: 'http://iscn.io/entity',
        footprint: 'http://iscn.io/footprint',
        rewardProportion: 'http://iscn.io/rewardProportion',
      },
    },
  },
  '@id': 'iscn://likecoin-chain/25L-03N8vJCLZOypQUYsjYd4ZbI6iRPUxFynm31mGQU/1',
  '@type': 'Record',
  contentFingerprints: [],
  contentMetadata: {
    '@context': 'http://schema.org/',
    '@type': 'Article',
    description: 'Launch of LikeCoin Airdrop The long-awaited 50 million...',
    keywords: 'Airdrop,Civic Liker,Depub,LikeCoin,Progress Update',
    usageInfo: '',
    version: 1,
  },
  recordNotes: '',
  recordTimestamp: '2022-05-04T14:32:38+00:00',
  recordVersion: 1,
  stakeholders: [
  ],
};
const iscnDataMainnet = {
  '@context': {
    '@vocab': 'http://iscn.io/',
    contentMetadata: { '@context': null },
    recordParentIPLD: { '@container': '@index' },
    stakeholders: { '@context': [Object] },
  },
  '@id': 'iscn://likecoin-chain/LYVNpAnfZ89VDkWP1C3w4VhjlzSvQE3OCI7ufbmCA_0/1',
  '@type': 'Record',
  contentFingerprints: [
    'ipfs://QmYapLrvvTHfxBhaJATzdWRYbWTPLzNDJ7VLPWx2bAnH57',
    'ar://vM6QhMZC1q-Zf5d7ABFxChWsBdOZu_6ln75rC1R2x6o',
  ],
  contentMetadata: {
    '@context': 'http://schema.org/',
    '@type': 'CreativeWork',
    description: 'https://github.com/likecoin/LikeCoinButton-integration',
    exifInfo: {},
    keywords: '',
    name: 'LikeCoin button - LikeCoin',
    url: 'https://docs.like.co/developer/likecoin-button/',
    usageInfo: '',
    version: 1,
  },
  recordNotes: '',
  recordTimestamp: '2022-09-08T05:24:49+00:00',
  recordVersion: 1,
  stakeholders: [
    {
      contributionType: 'http://schema.org/author',
      entity: {
        '@id': 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
        description: 'https://github.com/likecoin/LikeCoinButton-integration',
        identifier: [Array],
        name: '',
        sameAs: [],
        url: '',
      },
      rewardProportion: 1,
    },
    {
      contributionType: 'test',
      entity: {
        '@id': 'like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5',
        description: 'test',
        identifier: [Array],
        name: '',
        sameAs: [],
        url: '',
      },
      rewardProportion: 1,
    },
    {
      contributionType: 'test2',
      entity: {
        '@id': 'test',
        description: 'test',
        identifier: [Array],
        name: '',
        sameAs: [],
        url: '',
      },
      rewardProportion: 1,
    },
  ],
};

const iscnDataMainnet2 = {
  '@context': {
    '@vocab': 'http://iscn.io/',
    contentMetadata: { '@context': null },
    recordParentIPLD: { '@container': '@index' },
    stakeholders: { '@context': [Object] },
  },
  '@id': 'iscn://likecoin-chain/LYVNpAnfZ89VDkWP1C3w4VhjlzSvQE3OCI7ufbmCA_0/1',
  '@type': 'Record',
  contentFingerprints: [
    'ipfs://QmYapLrvvTHfxBhaJATzdWRYbWTPLzNDJ7VLPWx2bAnH57',
    'ar://vM6QhMZC1q-Zf5d7ABFxChWsBdOZu_6ln75rC1R2x6o',
  ],
  contentMetadata: {
    '@context': 'http://schema.org/',
    '@type': 'CreativeWork',
    description: 'https://github.com/likecoin/LikeCoinButton-integration',
    exifInfo: {},
    keywords: '',
    name: 'LikeCoin button - LikeCoin',
    url: 'https://docs.like.co/developer/likecoin-button/',
    usageInfo: '',
    version: 1,
  },
  recordNotes: '',
  recordTimestamp: '2022-09-08T05:24:49+00:00',
  recordVersion: 1,
  stakeholders: [
    {
      contributionType: 'test',
      entity: {
        '@id': 'cosmos1tej2qstg4q255s620ld74gyvw0nzhklu5p9qq0',
        description: 'test',
        identifier: [Array],
        name: '',
        sameAs: [],
        url: '',
      },
      rewardProportion: 1,
    },
    {
      contributionType: 'test2',
      entity: {
        '@id': 'https://like.co/hsuehkuan',
        description: 'test',
        identifier: [Array],
        name: '',
        sameAs: [],
        url: '',
      },
      rewardProportion: 1,
    },
  ],
};

describe('stakeholderRatioCalculation', () => {
  test('calculateStakeholderRewards testnet totalAmount100', () => {
    const res = calculateStakeholderRewards(iscnDataTestnet, 'defaultWalletForTest', { totalAmount: '100' });
    const LIKEMap = new Map();
    LIKEMap.set('defaultWalletForTest', { amount: '100' });
    expect(res).toEqual(LIKEMap);
  });

  test('calculateStakeholderRewards testnet no totalAmount', () => {
    const res = calculateStakeholderRewards(iscnDataTestnet, 'defaultWalletForTest', { });
    const LIKEMap = new Map();
    LIKEMap.set('defaultWalletForTest', { amount: '1' });
    expect(res).toEqual(LIKEMap);
  });

  test('calculateStakeholderRewards testnet no totalAmount', () => {
    try {
      calculateStakeholderRewards(iscnDataTestnet, 'defaultWalletForTest', {});
    } catch (error) {
      expect(error).toEqual(new Error('No valid stakeholders and default wallet is not set'));
    }
  });

  test('calculateStakeholderRewards mainnet totalAmount100', () => {
    const res = calculateStakeholderRewards(iscnDataMainnet, 'defaultWalletForTest', { totalAmount: '100' });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { amount: '50' });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { amount: '50' });
    expect(res).toEqual(LIKEMap);
  });

  test('calculateStakeholderRewards mainnet no totalAmount', () => {
    const res = calculateStakeholderRewards(iscnDataMainnet, 'defaultWalletForTest', {});
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { amount: '0.5' });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { amount: '0.5' });
    expect(res).toEqual(LIKEMap);
  });

  test('calculateStakeholderRewards mainnet (no need LIKE_CO_API_ROOT)', () => {
    const res = calculateStakeholderRewards(iscnDataMainnet, 'defaultWalletForTest', { totalAmount: '100' });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { amount: '50' });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { amount: '50' });
    expect(res).toEqual(LIKEMap);
  });

  test('parseStakeholderAddresses mainnet', async () => {
    const res = await parseStakeholderAddresses(iscnDataMainnet, { LIKE_CO_API_ROOT: 'https://api.like.co' });
    expect(res).toEqual(iscnDataMainnet);
  });

  test('parseStakeholderAddresses testnet ', async () => {
    const res = await parseStakeholderAddresses(iscnDataTestnet, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    expect(res.stakeholders).toEqual([
      {
        contributionType: 'http://schema.org/author',
        entity: {
          '@id': 'like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5',
          name: 'likecoin',
        },
        rewardProportion: 1,
      },
    ]);
  });

  test('parseAndCalculateStakeholderRewards mainnet ', async () => {
    const res = await parseAndCalculateStakeholderRewards(iscnDataMainnet2, 'defaultWalletForTest', { LIKE_CO_API_ROOT: 'https://api.like.co', totalAmount: '100' });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { amount: '50' });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { amount: '50' });
    expect(res).toEqual(LIKEMap);
  });

  test('parseAndCalculateStakeholderRewards testnet ', async () => {
    const res = await parseAndCalculateStakeholderRewards(iscnDataTestnet2, 'defaultWalletForTest', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalAmount: '100' });
    const LIKEMap = new Map();
    LIKEMap.set('defaultWalletForTest', { amount: '100' });
    expect(res).toEqual(LIKEMap);
  });

  test('parseAndCalculateStakeholderRewards testnet, number input ', async () => {
    const res = await parseAndCalculateStakeholderRewards(iscnDataTestnet2, 'defaultWalletForTest', { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalAmount: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('defaultWalletForTest', { amount: '100' });
    expect(res).toEqual(LIKEMap);
  });
});
