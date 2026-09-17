const tokens = {
  sepolia: {
    USDC: process.env.SEPOLIA_USDC_CONTRACT || null,
    USDT: process.env.SEPOLIA_USDT_CONTRACT || null,
  },

  shasta: {
    USDT: process.env.SHASTA_USDT_CONTRACT || null,
  },
};

const getTokenAddress = (network, asset) => {
  const networkTokens = tokens[network];

  if (!networkTokens) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const address = networkTokens[asset];

  if (!address) {
    throw new Error(
      `${asset} contract is not configured for ${network}`
    );
  }

  return address;
};

module.exports = {
  tokens,
  getTokenAddress,
};