const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const fs = require('fs');
const { getHexSeedFromMnemonic } = require("./utils/getHexSeedFromMnemonic");
require('dotenv').config()

const provider = process.env.RPC_URL;
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const mnemonic = process.env.MNEMONIC
const hexseed = getHexSeedFromMnemonic(mnemonic)
const contractAddress = process.env.CUSTOM_ERC20_FACTORY_ADDRESS

if (!hexseed) {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

const acc = web3.zond.accounts.seedToAccount(hexseed)
web3.zond.wallet?.add(hexseed)
web3.zond.transactionConfirmationBlocks = config.tx_required_confirmations

const handleConfirmation = (data) => {
    fs.writeFileSync(
        './confirmation.json',
        JSON.stringify(data, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value,
            4
        ),
        'utf-8'
    );
};

const handleReceipt = (data) => {
    fs.writeFileSync(
        './receipt.json',
        JSON.stringify(data, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value,
            4
        ),
        'utf-8'
    );
};

const deployCustomERC20Token = async () => {
    console.log('Attempting to call the contract transfer method from account:', acc.address)

    let output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].abi

    const contract = new web3.zond.Contract(contractABI, contractAddress)

    const contractTransfer = contract.methods.createToken("TOKEN", "TOK", "1000000000000000000000000000", 18, "1000000000000000000000000000", "Z0000000000000000000000000000000000000000", "Z0000000000000000000000000000000000000000", "100000000000000000000000", "100000000000000000000000");
    const estimatedGas = await contractTransfer.estimateGas({ "from": acc.address })
    const txObj = { type: '0x2', gas: Number(estimatedGas) * 2, from: acc.address, data: contractTransfer.encodeABI(), to: contractAddress }

    await web3.zond.sendTransaction(txObj, undefined, { checkRevertBeforeSending: true })
        .on('confirmation', handleConfirmation)
        .on('receipt', handleReceipt)
        .on('error', console.error)
}

deployCustomERC20Token()
