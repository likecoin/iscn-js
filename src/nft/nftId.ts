import { createHash } from 'crypto';
import { bech32 } from 'bech32';
import { getISCNPrefix } from '../iscn/parsing';

function calculateNFTClassId(
  prefix: Uint8Array,
  serial = 0,
): string {
  const bytes = Buffer.concat([
    prefix,
    Buffer.from(serial.toString(), 'utf8'),
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
  const prefix = Buffer.from(iscnIdPrefix, 'utf8');
  return calculateNFTClassId(prefix, numberOfExistingNFTClass);
}

export default calculateNFTClassIdByISCNId;
