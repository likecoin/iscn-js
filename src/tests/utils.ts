import { createHash } from 'crypto';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import globalThis from '../globalThis';

export async function computeTransactionHash(signed: TxRaw): Promise<string> {
  const tx = Uint8Array.from(TxRaw.encode(signed).finish());
  const sha256 = createHash('sha256');
  const txHash = sha256
    .update(globalThis.Buffer.from(tx.buffer))
    .digest('hex');
  return txHash.toUpperCase();
}

export default computeTransactionHash;
