import axios, { AxiosResponse } from 'axios';

export async function getLikeWalletByLikerId(likerId: string, LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < string | void | null > {
  try {
    return await axios.get(`${LIKE_CO_API_ROOT}/users/id/${likerId}/min`)
      .then((element: AxiosResponse): string | undefined => element?.data?.likeWallet);
  } catch (error) {
    return null;
  }
}

export async function getLikerIdByWallet(wallet: string | null, LIKE_CO_API_ROOT = 'https://api.like.co')
: Promise < string | void | null > {
  try {
    return await axios.get(`${LIKE_CO_API_ROOT}/users/addr/${wallet}/min`)
      .then((element: AxiosResponse): string | undefined => element?.data?.user);
  } catch (error) {
    return null;
  }
}
