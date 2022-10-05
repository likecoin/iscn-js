import { bech32 } from 'bech32';

export function isValidAddress(address: string): boolean {
  try {
    bech32.decode(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function changeAddressPrefix(address: string, newPrefix: string): string {
  const { words } = bech32.decode(address);
  return bech32.encode(newPrefix, words);
}

export function getLikeWalletAddress(id: string | undefined): string | null {
  const addressLengthWithoutPrefixAnd1 = 38;
  let add = id;
  let likeWallet: string | null = null;
  if (id && id.startsWith('did:like:')) {
    add = `like1${id.slice(id.length - addressLengthWithoutPrefixAnd1)}`;
  } else if (id && id.startsWith('did:cosmos:')) {
    add = `cosmos1${id.slice(id.length - addressLengthWithoutPrefixAnd1)}`;
  }
  if (add && isValidAddress(add)) {
    likeWallet = changeAddressPrefix(add, 'like');
  }
  return likeWallet;
}
