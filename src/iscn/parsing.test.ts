import { getStakeholderMapFromParsedIscnData, addressParsingFromIscnData, getStakeholderMapFromIscnData } from './parsing';

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
  test('stakeholderRatioCalculation testnet totalLIKE100', async () => {
    const res = await getStakeholderMapFromParsedIscnData(iscnDataTestnet, { totalLIKE: 100, owner: 'ownerForTest' });
    const LIKEMap = new Map();
    LIKEMap.set('ownerForTest', { LIKE: 100 });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation testnet no totalLIKE', async () => {
    const res = await getStakeholderMapFromParsedIscnData(iscnDataTestnet, { owner: 'ownerForTest' });
    const LIKEMap = new Map();
    LIKEMap.set('ownerForTest', { LIKE: 1 });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation testnet no totalLIKE', async () => {
    try {
      await getStakeholderMapFromParsedIscnData(iscnDataTestnet, {});
    } catch (error) {
      expect(error).toEqual(new Error('Need owner'));
    }
  });

  test('stakeholderRatioCalculation mainnet totalLIKE100', async () => {
    const res = await getStakeholderMapFromParsedIscnData(iscnDataMainnet, { totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 50 });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 50 });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet no totalLIKE', async () => {
    const res = await getStakeholderMapFromParsedIscnData(iscnDataMainnet, {});
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 0.5 });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 0.5 });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet (no need LIKE_CO_API_ROOT)', async () => {
    const res = await getStakeholderMapFromParsedIscnData(iscnDataMainnet, { totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 50 });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 50 });
    expect(res).toEqual(LIKEMap);
  });

  test('addressParsingFromIscnData mainnet', async () => {
    const res = await addressParsingFromIscnData(iscnDataMainnet, { LIKE_CO_API_ROOT: 'https://api.like.co' });
    expect(res).toEqual(iscnDataMainnet);
  });

  test('addressParsingFromIscnData testnet ', async () => {
    const res = await addressParsingFromIscnData(iscnDataTestnet, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
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

  test('getStakeholderMapFromIscnData mainnet ', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataMainnet2, { LIKE_CO_API_ROOT: 'https://api.like.co', totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 50 });
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 50 });
    expect(res).toEqual(LIKEMap);
  });

  test('getStakeholderMapFromIscnData mainnet ', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataTestnet2, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalLIKE: 100, owner: 'ownerForTest' });
    const LIKEMap = new Map();
    LIKEMap.set('ownerForTest', { LIKE: 100 });
    expect(res).toEqual(LIKEMap);
  });
});
