const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { ISCNQueryClient, ISCNSigningClient } = require('@likecoin/iscn-js');

const {
  COSMOS_RPC_ENDPOINT = 'https://mainnet-node.like.co/rpc/',
  MNEMONIC_SEED_WORD = 'surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put',
} = process.env;

let queryClient = null;
let signingClient = null;
let signingWallet = null;

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
  return {
    address: signingWallet.address,
  };
}

module.exports = {
  getISCNQueryClient,
  getISCNSigningClient,
  getISCNSigningAddressInfo,
};
