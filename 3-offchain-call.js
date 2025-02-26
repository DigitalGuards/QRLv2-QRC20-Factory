const config = require("./config.json")
const contractCompiler = require("./contract-compiler")
const { Web3 } = require('@theqrl/web3')
const fs = require('fs');
require('dotenv').config()

const provider = process.env.RPC_URL
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const customERC20ADdress = process.env.CUSTOM_ERC20_ADDRESS;

const accAddress = "Z2019EA08f4e24201B98f9154906Da4b924A04892"

const checkMyTokenBalance = async () => {
    console.log('Attempting to check Token balance for account:', accAddress)

    const output = contractCompiler.GetCompilerOutput()
    const contractABI = output.contracts['CustomERC20.hyp']['CustomERC20'].abi

    // fs.writeFileSync("./CustomERC20ABI.json", JSON.stringify(contractABI, null, 4), 'utf-8')
    // throw new Error("custom")
    
    const contract = new web3.zond.Contract(contractABI, customERC20ADdress)
    contract.methods.balanceOf(accAddress).call().then((result, error)=>{
        if(error) {
            console.log(error)
        } else {
            console.log("Balance: " + result)
        }
    })
}

checkMyTokenBalance()