const { HDNodeWallet } = require("ethers");
const { TronWeb } = require("tronweb");

const EVM_MNEMONIC = process.env.EVM_DEPOSIT_MNEMONIC;
const TRON_MNEMONIC = process.env.TRON_DEPOSIT_MNEMONIC;

const deriveEvmWallet = (index) => {
  if (!EVM_MNEMONIC) {
    throw new Error("EVM_DEPOSIT_MNEMONIC is not configured");
  }

  const path = `m/44'/60'/0'/0/${index}`;

  const wallet = HDNodeWallet.fromPhrase(
    EVM_MNEMONIC,
    undefined,
    path
  );

  return {
    address: wallet.address,
    keyReference: `evm-deposit-${index}`,
    derivationIndex: index,
  };
};

const deriveTronWallet = (index) => {
  if (!TRON_MNEMONIC) {
    throw new Error("TRON_DEPOSIT_MNEMONIC is not configured");
  }

  const path = `m/44'/195'/0'/0/${index}`;

  const wallet = HDNodeWallet.fromPhrase(
    TRON_MNEMONIC,
    undefined,
    path
  );

  const address = TronWeb.address.fromPrivateKey(
    wallet.privateKey
  );

  return {
    address,
    keyReference: `tron-deposit-${index}`,
    derivationIndex: index,
  };
};

const generateDepositWallet = (network, index) => {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Invalid derivation index");
  }

  if (
  network === "ethereum" ||
  network === "arbitrum" ||
  network === "bnb"
) {
  return deriveEvmWallet(index);
}

if (network === "tron") {
  return deriveTronWallet(index);
}

  throw new Error(`Unsupported network: ${network}`);
};

const getDepositWallet = (network, index) => {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Invalid derivation index");
  }

  if (
    network === "ethereum" ||
    network === "arbitrum" ||
    network === "bnb"
  ) {
    if (!EVM_MNEMONIC) {
      throw new Error("EVM_DEPOSIT_MNEMONIC is not configured");
    }

    const path = `m/44'/60'/0'/0/${index}`;

    return HDNodeWallet.fromPhrase(
      EVM_MNEMONIC,
      undefined,
      path
    );
  }

  if (network === "tron") {
    if (!TRON_MNEMONIC) {
      throw new Error("TRON_DEPOSIT_MNEMONIC is not configured");
    }

    const path = `m/44'/195'/0'/0/${index}`;

    return HDNodeWallet.fromPhrase(
      TRON_MNEMONIC,
      undefined,
      path
    );
  }

  throw new Error(`Unsupported deposit network: ${network}`);
};

module.exports = {
  generateDepositWallet,
  getDepositWallet,
};