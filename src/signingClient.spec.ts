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
            gas: '180950',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '1809500' })]),
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
            gas: '181169',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '1811690' })]),
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
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '254479' }) }) }),
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
            gas: '180950',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '180950' })]),
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
    expect(hash).toEqual('79EF19B2E76F5A2066E753D1F60D30174263C4EB73CBEEE1339A9BD18F80FE6A');
    const signedTxRaw2 = await client.createISCNRecord(
      wallet.address, testData2, {
        broadcast: false, sequence: 2, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash2 = await computeTransactionHash(signedTxRaw2 as TxRaw);
    expect(hash2).toEqual('EE5515A0798E8CC26EFB62851ACFFFCC20C1423FF8088F07DAD1A07071A98C85');
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
    expect(hash).toEqual('F7DBD65322EB5ECC405172609001ED1B20AB328B601B3E76C882527E6459C430');
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
    expect(hash).toEqual('0FED285EC46E63C63A1B59525E930A10D9AA4B8BD2610A04C9CBFE7332B37A5E');
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
