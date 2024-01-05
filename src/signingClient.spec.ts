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
            gas: '301310',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '3013100000' })]),
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
            gas: '301573',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '3015730000' })]),
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
      expect.objectContaining({ gas: expect.objectContaining({ fee: expect.objectContaining({ gas: '389545' }) }) }),
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
            gas: '301310',
            amount: expect.arrayContaining([expect.objectContaining({ amount: '301310' })]),
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
    expect(hash).toEqual('471F89BD0AC79AE9DD9444BD73E22E98C6B11BAA172036B6C53DCC490928EDDD');
    const signedTxRaw2 = await client.createISCNRecord(
      wallet.address, testData2, {
        broadcast: false, sequence: 2, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash2 = await computeTransactionHash(signedTxRaw2 as TxRaw);
    expect(hash2).toEqual('9A1443971336F73D259A717F9252D13E5921606C61CD652E6753E15548467098');
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
    expect(hash).toEqual('8DCE3F2AC76216449FE7B126E9505817847290DD9FCF0EFADF12DC451DAA54D9');
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
    expect(hash).toEqual('28C279F64C06A28A0F2861231C6A6395C6FA90E507CCB6052E80FF82F94632A3');
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
    expect(hash).toEqual('200CEA82422C5122BB648C393F3AA43AAF7B3DEEBBE2CD9138F2301045D856F0');
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
    expect(hash).toEqual('FC8AA031CAA7ACF1ECB0A4FC5BC753D2B3A29A1B45ACD19D9156575DB525012E');
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
    expect(hash).toEqual('BBFD14DC52CCE6227CB5C3881787ED11ECC74517D78443CF8AA2EA21A20D05A8');
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
    expect(hash).toEqual('2D79206BBA9E422E735693A795A230AFF9A3A9BFEFF193EF3CE6548EC711F4F6');
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
    expect(hash).toEqual('6A5393AAB1D2213E12DFA881D778F1B2B1A8929C5D81270C2D2D930FDA1B4CDD');
  });
});
