// eslint-disable-next-line import/no-extraneous-dependencies
import { DirectSecp256k1HdWallet, AccountData } from '@cosmjs/proto-signing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { ISCNSigningClient } from './signingClient';
import { computeTransactionHash } from './tests/utils';
import { mnemonic0, address1 } from './tests/key.json';
import testData1 from './tests/iscn-sample-1.json';
import testData2 from './tests/iscn-sample-2.json';
import { ISCN_ID, NFT_CLASS_ID } from './tests/constant';

let signingClient: ISCNSigningClient | undefined;
let signingWallet: AccountData | undefined;

async function getSigner() {
  if (!signingWallet || !signingClient) {
    const client = new ISCNSigningClient();
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic0);
    await client.connectWithSigner('https://mainnet-node.like.co/rpc/', signer);
    const [wallet] = await signer.getAccounts();
    signingClient = client;
    signingWallet = wallet;
  }
  return { client: signingClient, wallet: signingWallet };
}

describe('signingClient ISCN', () => {
  test('Estimate ISCN gas and fee', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData1);
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '180925',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '1809250' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2960000' }) }),
    );
  });

  test('Estimate ISCN gas and fee with memo', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData1, { memo: 'testing' });
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '181143',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '1811430' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2960000' }) }),
    );
  });

  test('Estimate large ISCN gas and fee', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData2);
    expect(res).toEqual(
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '254454' }) }) }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '5986000' }) }),
    );
  });

  test('Estimate ISCN gas with custom gas price', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData1, { gasPrice: 1 });
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '180925',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '180925' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '2960000' }) }),
    );
  });

  test('Sign ISCN create record with sign param', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createISCNRecord(
      wallet.address, testData1, {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('9409BD2C37245A51B5BC69847F8792B92A8BDE8EACE688AF33127F235B0FAA6B');
    const signedTxRaw2 = await client.createISCNRecord(
      wallet.address, testData2, {
        broadcast: false, sequence: 2, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash2 = await computeTransactionHash(signedTxRaw2 as TxRaw);
    expect(hash2).toEqual('F67C1A184DBEEEDA84F917663890D0F38103E0D09CE9D23721B7BD43861DD368');
  });
});

describe('signingClient NFT', () => {
  test('Sign create NFT class', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createNFTClass(
      wallet.address,
      ISCN_ID,
      { name: 'Liker NFT #1', metadata: { a: 'b' } },
      undefined,
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('21C16C52DF6D012491D81AE9ACF7A515A08205710352B04DFDD33F6D5A3C7A8F');
  });

  test('Sign mint NFT', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.mintNFTs(
      wallet.address,
      NFT_CLASS_ID,
      [...Array(100).keys()].map((i) => ({
        id: `testing-321321-${i}`,
        uri: 'testing-12341234',
        metadata: {
          a: 'b',
        },
      })),
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('DCEFD72642CCC5B392568F4AAA1A8613F1C3394FC75EF3838E522864B367C642');
  });
});

describe('signingClient Royalty', () => {
  test('Sign create royalty config', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createRoyaltyConfig(
      wallet.address,
      NFT_CLASS_ID,
      {
        rateBasisPoints: 10000,
        stakeholders: [{
          account: wallet.address,
          weight: 1,
        }],
      },
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('EB6A9B6C6C95D1C7FBD7C96518944FDD77D7949A92F266D38C5A0435AE80EF46');
  });
});

describe('signingClient authz', () => {
  test('Sign createSendGrant', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createSendGrant(
      wallet.address,
      address1,
      [{ denom: 'nanolike', amount: '1000000000' }],
      1655002000000,
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('3A2510680B81F4C7F06DBAFDDB300A26E0731F7422C85683166CAB91E897B9D5');
  });

  test('Sign executeSendGrant', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.executeSendGrant(
      wallet.address,
      address1,
      wallet.address,
      [{ denom: 'nanolike', amount: '1000000000' }],
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('28787C77CD79F0C292B2339DC6480622FC6713971B8E45875126F501AE3CBEFD');
  });
});
