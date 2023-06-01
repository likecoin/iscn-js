import BigNumber from 'bignumber.js';
import { getLikeWalletAddress, isValidAddress, changeAddressPrefix } from './addressParsing';
import { getLikeWalletByLikerId } from './likerIdsAddresses';
import { ISCNRecordData } from '../types';

export function getISCNPrefix(input: string): string {
  const res = /^(iscn:\/\/likecoin-chain\/[A-Za-z0-9-_]+)(?:\/([0-9]*))?$/.exec(input);
  if (!res) throw new Error(`Invalid ISCN ID ${input}`);
  const [, prefix] = res;
  return prefix;
}

async function getLikeWalletFromId(
  id: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = {},
)
: Promise < string | null > {
  let likeWallet: string | null = null;
  if (!id) return null;
  const match = id.match(/^https:\/\/like\.co\/([a-z0-9_-]{6,20})/);
  if (match) {
    const [, likerId] = match;
    if (likerId) likeWallet = await getLikeWalletByLikerId(likerId, { LIKE_CO_API_ROOT });
  } else {
    likeWallet = getLikeWalletAddress(id);
  }
  return likeWallet;
}

export function calculateStakeholderRewards(
  iscnData: ISCNRecordData,
  defaultWallet: string,
  { totalAmount = '1', precision = 9 }: { totalAmount?: string | number, precision?: number } = {},
)
: Map<string, { amount: string }> {
  const LIKEMap: Map<string, { amount: string }> = new Map();
  const { stakeholders } = iscnData;
  if (stakeholders?.length) {
    const likeWallets = stakeholders.map((stakeholder: any) => {
      const id: string = stakeholder.entity['@id'];
      if (id && isValidAddress(id)) {
        return changeAddressPrefix(id, 'like');
      }
      return null;
    });
    const weightMap = new Map();
    likeWallets.forEach((likeWallet: string | null, i) => {
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
      const amount = new BigNumber(
        weight.times(totalAmount).div(totalWeight).toFixed(precision, BigNumber.ROUND_DOWN),
      );
      if (amount && amount.gt(0)) LIKEMap.set(address, { amount: amount.toFixed() });
    });
  }
  if (LIKEMap.size === 0) {
    const amount = new BigNumber(totalAmount).toFixed(precision, BigNumber.ROUND_DOWN);
    LIKEMap.set(defaultWallet, {
      amount: new BigNumber(amount).toFixed(),
    });
  }
  return LIKEMap;
}

export async function parseStakeholderAddresses(
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
        if (id) {
          const likeWallet = await getLikeWalletFromId(id, { LIKE_CO_API_ROOT });
          parsedStakeholder.entity['@id'] = likeWallet;
        }
        return parsedStakeholder;
      },
    ));
  }
  parsedIscnData.stakeholders = parsedStakeholders;
  return parsedIscnData;
}

export async function parseAndCalculateStakeholderRewards(
  iscnData: ISCNRecordData,
  defaultWallet: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co', totalAmount = '1', precision = 9 }: {
    LIKE_CO_API_ROOT?: string, totalAmount?: string | number, precision?: number,
  } = {},
)
: Promise < Map < string, { amount: string } > > {
  const parsedIscnData = await parseStakeholderAddresses(iscnData, { LIKE_CO_API_ROOT });
  const map = calculateStakeholderRewards(
    parsedIscnData,
    defaultWallet,
    { totalAmount, precision },
  );
  return map;
}
