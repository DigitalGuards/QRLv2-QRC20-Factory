const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
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

const provider = requireRpcUrl(process.env.RPC_URL)
const expectedChainId = requireExpectedChainId(config.chain_id)
const requiredConfirmations = requireConfirmationCount(config.tx_required_confirmations)
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const mnemonic = process.env.MNEMONIC
const hexseed = getHexSeedFromMnemonic(mnemonic)

if (!hexseed) {
    console.log("You need to enter a dilithium hexseed for this to work.")
    process.exit(1)
}

const acc = web3.qrl.accounts.seedToAccount(hexseed)
requireQAddress(acc.address, "deployer address")
web3.qrl.wallet?.add(hexseed)

const deployMyTokenContract = async () => {
    const chainId = await assertExpectedChain(web3, expectedChainId)
    console.log(`Connected to chain ${chainId}`)
    console.log('Attempting to deploy CustomERC20Factory contract from account:', acc.address)

    const output = contractCompiler.GetCompilerOutput()

    const contractABI = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].abi
    const contractByteCode = output.contracts['CustomERC20Factory.hyp']['CustomERC20Factory'].zvm.bytecode.object
    const contract = new web3.qrl.Contract(contractABI)

    const deployOptions = { data: contractByteCode, arguments: [] }
    const contractDeploy = contract.deploy(deployOptions)
    const estimatedGas = await contractDeploy.estimateGas({ from: acc.address })
    const gas = (estimatedGas * 12n) / 10n
    const gasPrice = await web3.qrl.getGasPrice()
    const txObj = { gas, gasPrice, from: acc.address, data: contractDeploy.encodeABI() }

    const receipt = await web3.qrl.sendTransaction(
        txObj,
        undefined,
        { checkRevertBeforeSending: true }
    )
    if (!receipt || !receipt.contractAddress) {
        throw new Error("Deployment receipt did not contain a contract address")
    }
    await waitForTransactionConfirmations(web3, receipt, requiredConfirmations)
    await assertContractCode(web3, receipt.contractAddress, "CustomERC20Factory")
    console.log("Contract address:", receipt.contractAddress)
}

deployMyTokenContract().catch((error) => {
    console.error("Deployment failed:", error.message)
    process.exitCode = 1
})
