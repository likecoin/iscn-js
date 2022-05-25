export const COSMOS_DENOM = 'nanolike';

export const DEFAULT_GAS_PRICE = [{ amount: 10, denom: COSMOS_DENOM }];

export const DEFAULT_GAS_PRICE_NUMBER = DEFAULT_GAS_PRICE[0].amount;

export const GAS_ESTIMATOR_BUFFER_RATIO = 0.25;
export const GAS_ESTIMATOR_SLOPE = 10.3;
export const GAS_ESTIMATOR_INTERCEPT = 110533;

export const ISCN_CHANGE_OWNER_GAS = 200000;

export const DEFAULT_RPC_ENDPOINT = 'https://mainnet-node.like.co/rpc/';
export const ISCN_REGISTRY_NAME = 'likecoin-chain';

export const ISCN_PREFIX = `iscn://${ISCN_REGISTRY_NAME}`;

export const STUB_WALLET = 'cosmos1rclg677y2jqt8x4ylj0kjlqjjmnn6w6304rrtc';
