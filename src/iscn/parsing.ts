import BigNumber from 'bignumber.js';
import { getLikeWalletAddress, isValidAddress, changeAddressPrefix } from './addressParsing';
import { getLikeWalletByLikerId } from './likerIdsAddresses';
import { ISCNRecordData } from '../types';

async function getLikeWalletFromId(
  id: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = {},
)
: Promise < { likeWallet: string | void | null } > {
  let likeWallet: string | void | null = null;
  let likerId: string | void | null = null;
  const match = id.match(/^https:\/\/like\.co\/([a-z0-9_-]{6,20})/);
  if (match) {
    [, likerId] = match;
    likeWallet = await getLikeWalletByLikerId(likerId, { LIKE_CO_API_ROOT });
  } else {
    likeWallet = getLikeWalletAddress(id);
  }
  return { likeWallet };
}

export function getStakeholderMapFromParsedIscnData(
  iscnData: ISCNRecordData,
  defaultWallet: string,
  { totalLIKE = 1 }: { totalLIKE?: number } = {},
)
: Map < string, { LIKE: number } > {
  const LIKEMap = new Map();
  const { stakeholders } = iscnData;
  if (stakeholders?.length) {
    const likeWallets = stakeholders.map((stakeholder:any) => {
      const id: string = stakeholder.entity['@id'];
      if (isValidAddress(id)) {
        return changeAddressPrefix(id, 'like');
      }
      return null;
    });
    const weightMap = new Map();
    likeWallets.forEach((likeWallet: any, i) => {
      if (likeWallet) {
        let weight = new BigNumber(stakeholders[i].rewardProportion);
        if (weightMap.has(likeWallet)) {
          weight = weightMap.get(likeWallet).weight.plus(weight);
        }
        weightMap.set(likeWallet, { weight });
      }
    });
    const totalWeight = [...weightMap.values()]
      .map(({ weight }) => weight)
      .reduce((prev, curr) => prev.plus(curr), new BigNumber(0));
    weightMap.forEach(({ weight }, address) => {
      const LIKE = new BigNumber(weight.times(totalLIKE).div(totalWeight).toFixed(9, 1)).toNumber();
      LIKEMap.set(address, { LIKE });
    });
  }
  if (LIKEMap.size === 0) {
    LIKEMap.set(defaultWallet, { LIKE: totalLIKE });
  }
  return LIKEMap;
}

export async function addressParsingFromIscnData(
  iscnData: ISCNRecordData,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = {},
)
: Promise < ISCNRecordData > {
  const parsedIscnData: ISCNRecordData = iscnData;
  const { stakeholders } = iscnData;
  let parsedStakeholders:any;
  if (stakeholders?.length) {
    parsedStakeholders = await Promise.all(stakeholders.map(
      async (stakeholder:any) => {
        const parsedStakeholder = stakeholder;
        const id: string = stakeholder.entity['@id'];
        const { likeWallet } = await getLikeWalletFromId(id, { LIKE_CO_API_ROOT });
        parsedStakeholder.entity['@id'] = likeWallet;
        return parsedStakeholder;
      },
    ));
  }
  parsedIscnData.stakeholders = parsedStakeholders;
  return parsedIscnData;
}

export async function getStakeholderMapFromIscnData(
  iscnData: ISCNRecordData,
  defaultWallet: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co', totalLIKE = 1 }: { LIKE_CO_API_ROOT?: string, totalLIKE?: number } = {},
)
: Promise < Map < string, { LIKE: number } > > {
  const parsedIscnData = await addressParsingFromIscnData(iscnData, { LIKE_CO_API_ROOT });
  const map = getStakeholderMapFromParsedIscnData(
    parsedIscnData,
    defaultWallet,
    { totalLIKE },
  );
  return map;
}
