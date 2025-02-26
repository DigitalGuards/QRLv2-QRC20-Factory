const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const fs = require('fs');
const { getHexSeedFromMnemonic } = require("./utils/getHexSeedFromMnemonic");
require('dotenv').config()

const provider = process.env.RPC_URL
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const mnemonic = process.env.MNEMONIC
const hexseed = getHexSeedFromMnemonic(mnemonic)

if (!hexseed) {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

const acc = web3.zond.accounts.seedToAccount(hexseed)
web3.zond.wallet?.add(hexseed)
web3.zond.transactionConfirmationBlocks = config.tx_required_confirmations

const receiptHandler = function (receipt) {
    console.log("Contract address ", receipt.contractAddress)
}

const deployMyTokenContract = async () => {
    console.log('Attempting to deploy CustomERC20Factory contract from account:', acc.address)

    const output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].abi

    // fs.writeFileSync("./CustomERC20FactoryABI.json", JSON.stringify(contractABI, null, 4), 'utf-8')
    // throw new Error("custom");

    const contractByteCode = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].zvm.bytecode.object
    const contract = new web3.zond.Contract(contractABI)

    const deployOptions = { data: contractByteCode, arguments: [] }
    const contractDeploy = contract.deploy(deployOptions)
    const estimatedGas = await contractDeploy.estimateGas({ from: acc.address })
    const txObj = { type: '0x2', gas: estimatedGas, from: acc.address, data: contractDeploy.encodeABI() }

    await web3.zond.sendTransaction(txObj, undefined, { checkRevertBeforeSending: false })
        .on('confirmation', console.log)
        .on('receipt', receiptHandler)
        .on('error', console.error)
}

deployMyTokenContract()
