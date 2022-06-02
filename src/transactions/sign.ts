// eslint-disable-next-line import/no-extraneous-dependencies
import { EncodeObject } from '@cosmjs/proto-signing';
import {
  assertIsDeliverTxSuccess,
  DeliverTxResponse,
  SignerData,
  SigningStargateClient,
  StdFee,
} from '@cosmjs/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { ISCNSignOptions } from '../types';

export async function signOrBroadcast(
  senderAddress: string,
  messages: EncodeObject[],
  fee: StdFee,
  signer: SigningStargateClient,
  {
    memo = '',
    broadcast = true,
    accountNumber,
    sequence,
    chainId,
  }: ISCNSignOptions = {},
): Promise<DeliverTxResponse | TxRaw> {
  if (!signer) throw new Error('SIGNING_CLIENT_NOT_CONNECTED');
  let signData: SignerData | undefined;
  if ((accountNumber !== undefined || sequence !== undefined || chainId !== undefined)) {
    if (!(accountNumber !== undefined && sequence !== undefined && chainId !== undefined)) {
      throw new Error('MUST_DEFINE_ALL_SIGNING_PARAM');
    }
    signData = {
      accountNumber,
      sequence,
      chainId,
    };
  }
  const txRaw = await signer.sign(senderAddress, messages, fee, memo, signData);
  if (!broadcast) {
    return txRaw;
  }
  const txBytes = TxRaw.encode(txRaw).finish();
  const response = await signer.broadcastTx(txBytes);
  assertIsDeliverTxSuccess(response);
  return response;
}

export default signOrBroadcast;
