const { Web3 } = require('@theqrl/web3')
const {
    hasDeployedCode,
    requireQAddress,
    requireRpcUrl,
} = require("./utils/deploymentSafety")
require('dotenv').config()

const provider = requireRpcUrl(process.env.RPC_URL)
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const contractAddress = process.env.CUSTOM_ERC20_FACTORY_ADDRESS || process.env.CUSTOM_ERC20_ADDRESS

const getCode = async () => {
    if (!contractAddress) {
        console.error("Set CUSTOM_ERC20_FACTORY_ADDRESS or CUSTOM_ERC20_ADDRESS in .env")
        process.exit(1)
    }

    try {
        requireQAddress(contractAddress, "contract address")
        const code = await web3.qrl.getCode(contractAddress, 'latest')
        if (!hasDeployedCode(code)) {
            console.log(`No contract deployed at ${contractAddress}`)
        } else {
            console.log(`Contract at ${contractAddress} has bytecode (${code.length} chars):`)
            console.log(code)
        }
    } catch (error) {
        console.error("getCode failed:", error.message)
        process.exit(1)
    }
}

getCode()
