import BigNumber from 'bignumber.js';
import { getLikeWalletAddress } from './addressParsing';
import { getLikerIdByWallet, getLikeWalletByLikerId } from './likerIdsAddresses';

async function getLikeWalletAndLikerIdFromId(
  id: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = { LIKE_CO_API_ROOT: 'https://api.like.co' },
)
: Promise < { likeWallet: string | void | null, likerId: string | void | null } > {
  let likeWallet: string | void | null = null;
  let likerId: string | void | null = null;
  const res = id.match(/^https:\/\/like\.co\/([a-z0-9_-]{6,20})/);
  if (res) {
    [, likerId] = res;
    likeWallet = await getLikeWalletByLikerId(likerId, { LIKE_CO_API_ROOT });
  } else {
    likeWallet = getLikeWalletAddress(id);
    likerId = await getLikerIdByWallet(likeWallet, { LIKE_CO_API_ROOT });
  }
  return { likeWallet, likerId };
}

export async function getStakeholderMapFromIscnData(
  iscnData: Record < any, any >,
  { LIKE_CO_API_ROOT = 'https://api.like.co', totalLIKE = 1 }: { LIKE_CO_API_ROOT?: string, totalLIKE?: number } = { LIKE_CO_API_ROOT: 'https://api.like.co', totalLIKE: 1 },
)
: Promise < Map < string, { LIKE: number, likerId: string } > > {
  const LIKEMap = new Map();
  const { stakeholders } = iscnData.records[0].data;
  if (stakeholders?.length) {
    const likeWalletsAndLikerIds = await Promise.all(stakeholders.map((stakeholder:any) => {
      const id: string = stakeholder.entity['@id'];
      return getLikeWalletAndLikerIdFromId(id, { LIKE_CO_API_ROOT });
    }));
    const weightMap = new Map();
    likeWalletsAndLikerIds.forEach((element: any, i) => {
      if (element.likeWallet) {
        let weight = new BigNumber(stakeholders[i].rewardProportion);
        if (weightMap.has(element.likeWallet)) {
          weight = weightMap.get(element.likeWallet).weight.plus(weight);
        }
        weightMap.set(element.likeWallet, { weight, likerId: element.likerId });
      }
    });
    const totalWeight = [...weightMap.values()]
      .map(({ weight }) => weight)
      .reduce((prev, curr) => prev.plus(curr), new BigNumber(0));
    weightMap.forEach(({ weight, likerId }, address) => {
      const LIKE = new BigNumber(weight.times(totalLIKE).div(totalWeight).toFixed(9, 1)).toNumber();
      LIKEMap.set(address, { LIKE, likerId });
    });
  }

  if (!LIKEMap.size) {
    const likerId = await getLikerIdByWallet(iscnData.owner, { LIKE_CO_API_ROOT });
    LIKEMap.set(iscnData.owner, { LIKE: totalLIKE, likerId });
  }
  return LIKEMap;
}

export async function addressParsingFromIscnData(
  iscnData: Record < any, any >,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string, totalLIKE?: number } = { LIKE_CO_API_ROOT: 'https://api.like.co', totalLIKE: 1 },
)
: Promise < Record < any, any > > {
  const parsedIscnData = iscnData;
  const { stakeholders } = iscnData.records[0].data;
  let parsedStakeholders;
  if (stakeholders?.length) {
    parsedStakeholders = await Promise.all(stakeholders.map(
      async (stakeholder:any) => {
        const parsedStakeholder = stakeholder;
        const id: string = stakeholder.entity['@id'];
        const { likeWallet } = await getLikeWalletAndLikerIdFromId(id, { LIKE_CO_API_ROOT });
        parsedStakeholder.entity['@id'] = likeWallet;
        return parsedStakeholder;
      },
    ));
  }
  parsedIscnData.records[0].data.stakeholders = parsedStakeholders;
  return parsedIscnData;
}
