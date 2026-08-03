const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const {
    assertContractCode,
    requireQAddress,
    requireRpcUrl,
} = require("./utils/deploymentSafety");
require('dotenv').config()

const provider = requireRpcUrl(process.env.RPC_URL)
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const customQRC20Address = requireQAddress(
    process.env.CUSTOM_ERC20_ADDRESS,
    "token address"
);

const accAddress = requireQAddress(
    process.env.HOLDER_ADDRESS || "Q0000000000000000000000000000000000000000",
    "holder address"
)

const checkTokenInfo = async () => {
    await assertContractCode(web3, customQRC20Address, "CustomERC20")
    console.log('Attempting to check Token info for account:', accAddress)

    const output = contractCompiler.GetCompilerOutput()
    const contractABI = output.contracts['CustomERC20.hyp']['CustomERC20'].abi

    const contract = new web3.qrl.Contract(contractABI, customQRC20Address)
    
    const name = await contract.methods.name().call()
    const symbol = await contract.methods.symbol().call()
    const decimals = await contract.methods.decimals().call()
    const totalSupply = await contract.methods.totalSupply().call()
    const balance = await contract.methods.balanceOf(accAddress).call()

    console.log("Token Name:", name)
    console.log("Token Symbol:", symbol)
    console.log("Decimals:", decimals)
    console.log("Total Supply:", totalSupply)
    console.log("Balance for", accAddress + ":", balance)
}

checkTokenInfo().catch((error) => {
    console.error("Token lookup failed:", error.message)
    process.exitCode = 1
})
