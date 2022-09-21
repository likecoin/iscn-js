import BigNumber from 'bignumber.js';
import { ISCNQueryClient } from '../queryClient';
import { getLikeWalletAddress } from './addressParsing';
import { getLikerIdByWallet, getLikeWalletByLikerId } from './likerIdsAddresses';

export async function getNFTQueryClient(LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < ISCNQueryClient > {
  const client = new ISCNQueryClient();
  const NFT_RPC_ENDPOINT = (LIKE_CO_API_ROOT === 'https://api.like.co') ? 'https://node.like.co/rpc/' : 'https://node.testnet.like.co/rpc/';
  await client.connect(NFT_RPC_ENDPOINT);
  return client;
}
export async function getNFTISCNData(iscnId:string, LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < { owner: string | undefined, data: any | undefined } > {
  const client = await getNFTQueryClient(LIKE_CO_API_ROOT);
  const res = await client.queryRecordsById(iscnId);
  return {
    owner: res?.owner,
    data: res?.records[0]?.data,
  };
}

export async function getLikeWalletAndLikerIdFromId(id: string, LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < { likeWallet: string | void | null, likerId: string | void | null } > {
  let likeWallet: string | void | null = null;
  let likerId: string | void | null = null;
  const res = id.match(/^https:\/\/like\.co\/([a-z0-9_-]{6,20})/);
  if (res) {
    [, likerId] = res;
    likeWallet = await getLikeWalletByLikerId(likerId, LIKE_CO_API_ROOT);
  } else {
    likeWallet = getLikeWalletAddress(id);
    likerId = await getLikerIdByWallet(likeWallet, LIKE_CO_API_ROOT);
  }
  return { likeWallet, likerId };
}

export async function getStakeholderMap(iscnId: string, totalLIKE: number, LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < Map < string, { LIKE: number, likerId: string } > > {
  const { owner, data } = await getNFTISCNData(iscnId, LIKE_CO_API_ROOT);
  if (!owner) throw new Error(`ISCN with ID ${iscnId} not found`);
  const LIKEMap = new Map();
  const { stakeholders } = data;
  if (stakeholders?.length) {
    const likeWalletsAndLikerIds = await Promise.all(stakeholders.map((stakeholder:any) => {
      const id: string = stakeholder.entity['@id'];
      return getLikeWalletAndLikerIdFromId(id, LIKE_CO_API_ROOT);
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
    const likerId = await getLikerIdByWallet(owner);
    LIKEMap.set(owner, { LIKE: totalLIKE, likerId });
  }
  return LIKEMap;
}
