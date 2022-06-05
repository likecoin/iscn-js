# Example ISCN server

A server that wraps `iscn-js` in an HTTP API.

Sample env configuration:
```
COSMOS_CHAIN_ID='likecoin-mainnet-2'
COSMOS_RPC_ENDPOINT='https://mainnet-node.like.co/rpc/'
MNEMONIC_SEED_WORD='surround miss nominee dream gap cross assault thank captain prosper drop duty group candy wealth weather scale put'
```

To run:
```
$ node src/index.js
```

To perform a registration, `POST` to `locahost:3000`, e.g:
```
$  curl -X POST localhost:3000/iscn/new -d '{"metadata": <YOUR ISCN PAYLOAD>}'
```

The ISCN payload should be in the format specified by the ISCN schema: https://github.com/likecoin/iscn-specs/tree/master/schema
