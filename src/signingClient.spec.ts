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
            amount: expect.arrayContaining([expect.objectContaining({ amount: '2000000000' })]),
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
            amount: expect.arrayContaining([expect.objectContaining({ amount: '2000000000' })]),
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
    expect(hash).toEqual('C0C2F3A2597B6369EF25BCD8277691EA994DDC3169CAE87A960B7F37EB50E7B9');
    const signedTxRaw2 = await client.createISCNRecord(
      wallet.address, testData2, {
        broadcast: false, sequence: 2, accountNumber: 0, chainId: 'likecoin-mainnet-2',
      },
    );
    const hash2 = await computeTransactionHash(signedTxRaw2 as TxRaw);
    expect(hash2).toEqual('F95E3B46E8E8478545AAE61693E92E17833E8FAE6BA40036A513C81351C6863E');
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
    expect(hash).toEqual('816DE1B2C47C721696C392D85DA1F3EE711B2C93B2CB748D8B8262C07C40C121');
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
    expect(hash).toEqual('02B2D991D4683CFD853333C40425F9139162DDE8702F5DC6DCAD449FB01D0C2B');
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
    expect(hash).toEqual('7FE8A745F5C5A01708DFE08998F5BBA32591D26FBE55833254ABF799BD0A0933');
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
    expect(hash).toEqual('59BB525CC5FD4D740D07453990E23B3ADBBA927688715ED73A88F6F6B538F37A');
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
    expect(hash).toEqual('386C409920F2C371B2806860A472EFF6318B531CB1F3299DDCDF4A814AA52C56');
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
