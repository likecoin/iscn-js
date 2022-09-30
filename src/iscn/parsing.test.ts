import { getStakeholderMapFromIscnData, addressParsingFromIscnData } from './stakeholderRatioCalculation';

const iscnDataTestnet = {
  owner: 'like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5',
  latest_version: '1',
  records: [
    {
      ipld: 'baguqeerajcu2dcad33uquzx7ay2u7ufol5zyzdpnksyem4luzseuqypoputq',
      data: {
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
      },
    },
  ],
};

const iscnDataMainnet = {
  owner: 'like156gedr03g3ggwktzhygfusax4df46k8dh6w0me',
  latestVersion: '1',
  records: [
    {
      ipld: 'baguqeerax32yn3jl3vzospditp53rtkphkoxpjyxfayyj43xqlg6mmvvj2cq',
      data: {
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
        ],
      },
    },
  ],
};

describe('stakeholderRatioCalculation', () => {
  test('stakeholderRatioCalculation testnet totalLIKE100', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataTestnet, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co', totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 100, likerId: 'testforkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation testnet no totalLIKE', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataTestnet, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    const LIKEMap = new Map();
    LIKEMap.set('like1tej2qstg4q255s620ld74gyvw0nzhklu8aezr5', { LIKE: 1, likerId: 'testforkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet totalLIKE100', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataMainnet, { LIKE_CO_API_ROOT: 'https://api.like.co', totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 100, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet no totalLIKE', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataMainnet, { LIKE_CO_API_ROOT: 'https://api.like.co' });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 1, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('stakeholderRatioCalculation mainnet (no need LIKE_CO_API_ROOT)', async () => {
    const res = await getStakeholderMapFromIscnData(iscnDataMainnet, { totalLIKE: 100 });
    const LIKEMap = new Map();
    LIKEMap.set('like156gedr03g3ggwktzhygfusax4df46k8dh6w0me', { LIKE: 100, likerId: 'hsuehkuan' });
    expect(res).toEqual(LIKEMap);
  });

  test('addressParsingFromIscnData mainnet (no need LIKE_CO_API_ROOT)', async () => {
    const res = await addressParsingFromIscnData(iscnDataMainnet);
    expect(res).toEqual(iscnDataMainnet);
  });

  test('addressParsingFromIscnData mainnet', async () => {
    const res = await addressParsingFromIscnData(iscnDataMainnet, { LIKE_CO_API_ROOT: 'https://api.like.co' });
    expect(res).toEqual(iscnDataMainnet);
  });

  test('addressParsingFromIscnData testnet ', async () => {
    const res = await addressParsingFromIscnData(iscnDataTestnet, { LIKE_CO_API_ROOT: 'https://api.rinkeby.like.co' });
    expect(res.records[0].data.stakeholders).toEqual([
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
});
