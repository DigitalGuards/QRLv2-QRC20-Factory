const { Web3 } = require('@theqrl/web3')
require('dotenv').config()

const provider = process.env.RPC_URL
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const contractAddress = process.env.CUSTOM_ERC20_FACTORY_ADDRESS || process.env.CUSTOM_ERC20_ADDRESS

const getCode = async () => {
    if (!contractAddress) {
        console.error("Set CUSTOM_ERC20_FACTORY_ADDRESS or CUSTOM_ERC20_ADDRESS in .env")
        process.exit(1)
    }

    try {
        const code = await web3.qrl.getCode(contractAddress, 'latest')
        if (!code || code === '0x' || code === '0x0') {
            console.log(`No contract deployed at ${contractAddress}`)
        } else {
            console.log(`Contract at ${contractAddress} has bytecode (${code.length} chars):`)
            console.log(code)
        }
    } catch (error) {
        console.error("getCode failed:", error)
        process.exit(1)
    }
}

getCode()
