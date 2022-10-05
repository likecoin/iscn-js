import axios, { AxiosResponse } from 'axios';

export async function getLikeWalletByLikerId(
  likerId: string,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = {},
)
: Promise < string | null > {
  try {
    const userDataResponse : AxiosResponse = await axios.get(`${LIKE_CO_API_ROOT}/users/id/${likerId}/min`);
    return userDataResponse?.data?.likeWallet;
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      // eslint-disable-next-line
      console.error('getLikeWalletByLikerId Error', error?.response?.data || error);
      throw error;
    }
    return null;
  }
}

export async function getLikerIdByWallet(
  wallet: string | null,
  { LIKE_CO_API_ROOT = 'https://api.like.co' }: { LIKE_CO_API_ROOT?: string } = {},
)
: Promise < string | null > {
  try {
    const addrDataResponse : AxiosResponse = await axios.get(`${LIKE_CO_API_ROOT}/users/addr/${wallet}/min`);
    return addrDataResponse?.data?.user;
  } catch (error:any) {
    if (error?.response?.status !== 404) {
      // eslint-disable-next-line
      console.error('getLikerIdByWallet Error', error?.response?.data || error);
      throw error;
    }
    return null;
  }
}
