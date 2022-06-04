const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { ISCNQueryClient, ISCNSigningClient } = require('@likecoin/iscn-js');
// eslint-disable-next-line import/no-extraneous-dependencies
const { Tendermint34Client } = require('@cosmjs/tendermint-rpc');
const {
  QueryClient, setupAuthExtension, setupBankExtension,
} = require('@cosmjs/stargate');
const { BaseAccount } = require('cosmjs-types/cosmos/auth/v1beta1/auth');

const {
  COSMOS_CHAIN_ID = 'likecoin-mainnet-2',
  COSMOS_RPC_ENDPOINT = 'https://mainnet-node.like.co/rpc/',
  MNEMONIC_SEED_WORD = 'surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put',
} = process.env;

let queryClient = null;
let signingClient = null;
let signingWallet = null;
let signingAccountNumber = null;

let cosmosQueryClient = null;

async function getQueryClient() {
  if (!cosmosQueryClient) {
    const tendermint34Client = await Tendermint34Client.connect(COSMOS_RPC_ENDPOINT);
    const client = QueryClient.withExtensions(
      tendermint34Client,
      setupAuthExtension,
      setupBankExtension,
    );
    cosmosQueryClient = client;
  }
  return cosmosQueryClient;
}

async function getAccountInfo(address) {
  const client = await getQueryClient();
  const { value } = await client.auth.account(address);
  const accountInfo = BaseAccount.decode(value);
  return accountInfo;
}

async function getISCNQueryClient() {
  if (!queryClient) {
    const client = new ISCNQueryClient();
    await client.connect(COSMOS_RPC_ENDPOINT);
    queryClient = client;
  }
  return queryClient;
}

async function getISCNSigningClient() {
  if (!signingClient) {
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC_SEED_WORD);
    const [wallet] = await signer.getAccounts();
    const client = new ISCNSigningClient();
    await client.connectWithSigner(COSMOS_RPC_ENDPOINT, signer);
    signingWallet = wallet;
    signingClient = client;
  }
  return signingClient;
}

async function getISCNSigningAddressInfo() {
  if (!signingWallet) await getISCNSigningClient();
  if (!signingAccountNumber) {
    const { accountNumber } = await getAccountInfo(signingWallet.address);
    signingAccountNumber = accountNumber;
  }
  return {
    address: signingWallet.address,
    accountNumber: signingAccountNumber,
  };
}

module.exports = {
  COSMOS_CHAIN_ID,
  getAccountInfo,
  getISCNQueryClient,
  getISCNSigningClient,
  getISCNSigningAddressInfo,
};
