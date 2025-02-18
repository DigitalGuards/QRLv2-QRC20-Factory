const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.provider))
const {GetHexSeedFromMnemonic} = require('./getHexSeedFromMnemonic')
const dotenv = require('dotenv')
const fs = require('fs');

dotenv.config()

const mnemonic = process.env.MNEMONIC;
const hexseed = GetHexSeedFromMnemonic(mnemonic);

if(config.contract_address == "contract_address_here") {
    console.log("You need a to enter your contract address for this to work.")
    process.exit(1)
}

const acc = web3.zond.accounts.seedToAccount(hexseed)
web3.zond.wallet?.add(hexseed)
web3.zond.transactionConfirmationBlocks = config.tx_required_confirmations

const handleConfirmation = (data) => {
    fs.writeFileSync('./confirmation.json', JSON.stringify(data, null, 4), 'utf-8')
}

const handleReceipt = (data) => {
    fs.writeFileSync('./receipt.json', JSON.stringify(data, null, 4), 'utf-8')
}

const createToken = async () => {
    const contractABI = JSON.parse(fs.readFileSync('./contractABI.json', 'utf-8'));
    const contractAddress = config.contract_address
    const contract = new web3.zond.Contract(contractABI, contractAddress)
    const contractTransfer = contract.methods.createToken("TOKEN", "TOK", "1000000000000000000000000000", 18, "1000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "100000000000000000000000", "100000000000000000000000");
    const estimatedGas = await contractTransfer.estimateGas({"from": acc.address})
    const txObj = {type: '0x2', gas: Number(estimatedGas) * 2, from: acc.address, data: contractTransfer.encodeABI(), to: config.contract_address}
    await web3.zond.sendTransaction(txObj, undefined, { checkRevertBeforeSending: true })
    .on('confirmation', handleConfirmation)
    .on('receipt', handleReceipt)
    .on('error', console.error)
}

createToken()