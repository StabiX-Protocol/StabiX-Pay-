const { TronWeb } = require("tronweb");

const rpcUrl = process.env.TRON_RPC_URL;

if (!rpcUrl) {
  throw new Error("TRON_RPC_URL is not configured");
}

const tronWeb = new TronWeb({
  fullHost: rpcUrl,
});

const getTronWeb = () => {
  return tronWeb;
};

module.exports = {
  getTronWeb,
};