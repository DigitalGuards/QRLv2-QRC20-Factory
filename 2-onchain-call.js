const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const fs = require('fs');
const { getHexSeedFromMnemonic } = require("./utils/getHexSeedFromMnemonic");
const {
    assertContractCode,
    assertExpectedChain,
    requireConfirmationCount,
    requireExpectedChainId,
    requireQAddress,
    requireRpcUrl,
    waitForTransactionConfirmations,
} = require("./utils/deploymentSafety");
require('dotenv').config()

const provider = requireRpcUrl(process.env.RPC_URL);
const expectedChainId = requireExpectedChainId(config.chain_id)
const requiredConfirmations = requireConfirmationCount(config.tx_required_confirmations)
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const mnemonic = process.env.MNEMONIC
const hexseed = getHexSeedFromMnemonic(mnemonic)
const contractAddress = requireQAddress(
    process.env.CUSTOM_ERC20_FACTORY_ADDRESS,
    "factory address"
)

if (!hexseed) {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

const acc = web3.qrl.accounts.seedToAccount(hexseed)
requireQAddress(acc.address, "deployer address")
web3.qrl.wallet?.add(hexseed)

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

const tokenName = "QRL Token"
const tokenSymbol = "QT"
const initialSupply = "1000000000000000000000000000"
const decimals = 18
const maxSupply = "1000000000000000000000000000"
const recipient = "Q0000000000000000000000000000000000000000"
const maxWalletAmount = "100000000000000000000000"
const maxTxLimit = "100000000000000000000000"

const createCustomQRC20Token = async () => {
    const chainId = await assertExpectedChain(web3, expectedChainId)
    await assertContractCode(web3, contractAddress, "CustomERC20Factory")
    console.log(`Connected to chain ${chainId}`)
    console.log('Attempting to call the contract createToken method from account:', acc.address)

    let output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].abi

    const contract = new web3.qrl.Contract(contractABI, contractAddress)

    const createTokenMethod = contract.methods.createToken(tokenName, tokenSymbol, initialSupply, decimals, maxSupply, recipient, maxWalletAmount, maxTxLimit);
    const estimatedGas = await createTokenMethod.estimateGas({ from: acc.address })
    const gas = (estimatedGas * 12n) / 10n
    const gasPrice = await web3.qrl.getGasPrice()
    const txObj = { gas, gasPrice, from: acc.address, data: createTokenMethod.encodeABI(), to: contractAddress }

    const receipt = await web3.qrl.sendTransaction(
        txObj,
        undefined,
        { checkRevertBeforeSending: true }
    )
    handleReceipt(receipt)
    const confirmedReceipt = await waitForTransactionConfirmations(
        web3,
        receipt,
        requiredConfirmations
    )
    handleConfirmation({
        confirmations: requiredConfirmations,
        receipt: confirmedReceipt,
    })
}

createCustomQRC20Token().catch((error) => {
    console.error("Token creation failed:", error.message)
    process.exitCode = 1
})
