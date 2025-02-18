const { Web3 } = require('@theqrl/web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://qrlwallet.com/api/zond-rpc/testnet'))

const contractAddress = "0x51f688101f10ea1a780a97a6308257f376c3841e"

const getCode = async () => {
    const result = await web3.zond.getCode(contractAddress, "latest");
    console.log(result)
    // web3.zond.getCode(contractAddress, "latest", function(result, error) {
    //     if(error) {
    //         console.log(error)
    //     } else {
    //         console.log(result)
    //     }
    // });
}

getCode()
