const { MnemonicToSeedBin } = require("@theqrl/wallet.js");
const { Buffer } = require("buffer");
require("dotenv").config()

const GetHexSeedFromMnemonic = (mnemonic) => {
  if (!mnemonic) return "";
  const trimmedMnemonic = mnemonic.trim();
  if (!trimmedMnemonic) return "";
  const seedBin = MnemonicToSeedBin(trimmedMnemonic);
  console.log("0x".concat(Buffer.from(seedBin).toString("hex")))
  return "0x".concat(Buffer.from(seedBin).toString("hex"));
};

module.exports = {
  GetHexSeedFromMnemonic,
}
