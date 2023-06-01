import { createHash } from 'crypto';
import { bech32 } from 'bech32';
import { getISCNPrefix } from '../iscn/parsing';

export function calculateNFTClassIdByAccount(
  account: string,
  numberOfExistingNFTClass = 0,
): string {
  let bytes = Buffer.from(account, 'utf8');
  bytes = Buffer.concat([
    bytes,
    Buffer.from(numberOfExistingNFTClass.toString(), 'utf8'),
  ]);
  const sha256 = createHash('sha256');
  const hash = sha256.update(bytes).digest();
  return bech32.encode('likenft', bech32.toWords(hash));
}

export function calculateNFTClassIdByISCNId(
  iscnId: string,
  numberOfExistingNFTClass = 0,
): string {
  const iscnIdPrefix = getISCNPrefix(iscnId);
  return calculateNFTClassIdByAccount(iscnIdPrefix, numberOfExistingNFTClass);
}
