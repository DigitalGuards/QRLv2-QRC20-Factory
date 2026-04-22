const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const fs = require('fs');
require('dotenv').config()

const provider = process.env.RPC_URL
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const customERC20ADdress = process.env.CUSTOM_ERC20_ADDRESS;

const accAddress = "Z2019EA08f4e24201B98f9154906Da4b924A04892"

const checkTokenInfo = async () => {
    console.log('Attempting to check Token info for account:', accAddress)

    const output = contractCompiler.GetCompilerOutput()
    const contractABI = output.contracts['CustomERC20.hyp']['CustomERC20'].abi

    const contract = new web3.zond.Contract(contractABI, customERC20ADdress)
    
    try {
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
    } catch (error) {
        console.log("Error:", error)
    }
}

checkTokenInfo()