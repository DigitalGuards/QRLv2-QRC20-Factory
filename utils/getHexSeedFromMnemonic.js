const { MLDSA87 } = require("@theqrl/wallet.js");
require("dotenv").config();

const getHexSeedFromMnemonic = (mnemonic) => {
  if (!mnemonic) return "";
  const trimmedMnemonic = mnemonic.trim();
  if (!trimmedMnemonic) return "";
  const wallet = MLDSA87.newWalletFromMnemonic(trimmedMnemonic);
  return wallet.getHexExtendedSeed();
};

module.exports = {
  getHexSeedFromMnemonic,
};
