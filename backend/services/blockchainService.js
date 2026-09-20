const { ethers } = require("ethers");

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;

if (!rpcUrl) {
  throw new Error("BLOCKCHAIN_RPC_URL is not configured");
}

const provider = new ethers.JsonRpcProvider(
  rpcUrl,
  Number(process.env.BLOCKCHAIN_CHAIN_ID)
);

const getProvider = () => {
  return provider;
};

const testRpcConnection = async () => {
  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  return {
    chainId: network.chainId.toString(),
    blockNumber,
  };
};

const wsRpcUrl = process.env.BLOCKCHAIN_WS_URL || null;

const wsProvider = wsRpcUrl
  ? new ethers.WebSocketProvider(
      wsRpcUrl,
      Number(process.env.BLOCKCHAIN_CHAIN_ID)
    )
  : null;

const getWebSocketProvider = () => {
  if (!wsProvider) {
    throw new Error("BLOCKCHAIN_WS_URL is not configured");
  }

  return wsProvider;
};

module.exports = {
  getProvider,
  getWebSocketProvider,
  testRpcConnection,
};