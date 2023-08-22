// eslint-disable-next-line import/no-extraneous-dependencies
import { DirectSecp256k1HdWallet, AccountData } from '@cosmjs/proto-signing';
// eslint-disable-next-line import/no-extraneous-dependencies
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { ISCNSigningClient } from './signingClient';
import { computeTransactionHash } from './tests/utils';
import { mnemonic0, address1 } from './tests/key.json';
import testData1 from './tests/iscn-sample-1.json';
import testData2 from './tests/iscn-sample-2.json';
import { ISCN_ID, NFT_CLASS_ID, NFT_ID } from './tests/constant';

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
            gas: '200000',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '2000000' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '29600000' }) }),
    );
  });

  test('Estimate ISCN gas and fee with memo', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData1, { memo: 'testing' });
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '200000',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '2000000' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '29600000' }) }),
    );
  });

  test('Estimate large ISCN gas and fee', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData2);
    expect(res).toEqual(
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '277711' }) }) }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '59860000' }) }),
    );
  });

  test('Estimate ISCN gas with custom gas price', async () => {
    const { client } = await getSigner();
    const res = await client.esimateISCNTxGasAndFee(testData1, { gasPrice: 1 });
    expect(res).toEqual(
      expect.objectContaining({
        gas: expect.objectContaining({
          fee: expect.objectContaining({
            gas: '200000',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '200000' })]),
          }),
        }),
      }),
    );
    expect(res).toEqual(
      expect.objectContaining({ iscnFee: expect.objectContaining({ amount: '29600000' }) }),
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
    expect(hash).toEqual('B6F85222672D37A302AC323F3FF5DA83E873B31419FD3979DBBEED431497FE98');
    const signedTxRaw2 = await client.createISCNRecord(
      wallet.address, testData2, {
        broadcast: false, sequence: 2, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash2 = await computeTransactionHash(signedTxRaw2 as TxRaw);
    expect(hash2).toEqual('2927149B265F50292ED44B47C66D8D337E67EDD57FB7A387A1ECC98C2FE0ADF1');
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
    expect(hash).toEqual('EFC802279A38BD4315C1B0FF164336F3E49D61B2234D979FFFFF605F1610F941');
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
    expect(hash).toEqual('2D18E1A670B21CA09ED71313AA3DB07C1C25BBF8910D860E96B647BD93ECF4C6');
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
    expect(hash).toEqual('F322242AC30D829ACA54261E1D9B9600136964ABE8F12F216A72A9F63E1045D7');
  });
});

describe('signingClient NFT marketplace', () => {
  test('Sign create NFT listing', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createNFTListing(
      wallet.address,
      NFT_CLASS_ID,
      NFT_ID,
      100,
      867686400000,
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('8143EE793B6BE87AC65BD0E1B6064A246893699410C5C3A9473771A926FC6F7E');
  });

  test('Sign create NFT offer', async () => {
    const { client, wallet } = await getSigner();
    const signedTxRaw = await client.createNFTOffer(
      wallet.address,
      NFT_CLASS_ID,
      NFT_ID,
      100,
      867686400000,
      {
        broadcast: false, sequence: 1, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash = await computeTransactionHash(signedTxRaw as TxRaw);
    expect(hash).toEqual('091A830053500BD6DB4C20EF7CDD5CCF46F7D17FB3AE52E395DB09A815F1D64E');
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
