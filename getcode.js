const { Web3 } = require('@theqrl/web3')
require('dotenv').config()

const provider = process.env.RPC_URL
const web3 = new Web3(new Web3.providers.HttpProvider(provider))

const contractAddress = "Z38cad9d0889643c271a718ba98c99b32a6a8331c"

const getCode = async () => {
    const code = await web3.zond.getCode(contractAddress, 'latest', function(result, error) {
        if(error) {
            console.log(error)
        } else {
            console.log(result)
        }
    });

    console.log(code)
}

getCode()
