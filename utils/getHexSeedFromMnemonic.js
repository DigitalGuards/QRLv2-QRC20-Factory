const { MnemonicToSeedBin } = require("@theqrl/wallet.js");
const { Buffer } = require("buffer");
require("dotenv").config()

const getHexSeedFromMnemonic = (mnemonic) => {
  if (!mnemonic) return "";
  const trimmedMnemonic = mnemonic.trim();
  if (!trimmedMnemonic) return "";
  const seedBin = MnemonicToSeedBin(trimmedMnemonic);
  return "0x".concat(Buffer.from(seedBin).toString("hex"));
};

module.exports = {
  getHexSeedFromMnemonic,
}
