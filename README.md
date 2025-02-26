# Custom ERC20 Factory Project

## Overview

This project demonstrates the deployment and interaction with a custom ERC20 token factory on the Zond blockchain. The factory allows for the creation of ERC20 tokens with customizable parameters.

## Prerequisites

- Node.js and npm
- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) for managing Node.js versions
- Access to a Zond POS node

## Setup

### Step 1: Install the Zond POS Node

Follow the instructions here: [https://test-zond.theqrl.org/install](https://test-zond.theqrl.org/install)

### Step 2: Create a Zond Dilithium Wallet & Obtain Testnet QRL

Use the [wallet creation instructions](https://test-zond.theqrl.org/creating-wallet) to create a wallet and note the Dilithium public address. Obtain testnet QRL via the [QRL Discord](https://www.theqrl.org/discord).

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project. Use the `.env.example` as a template:

```
MNEMONIC=your_mnemonic_here
RPC_URL=http://localhost:8545
CUSTOM_ERC20_FACTORY_ADDRESS=your_contract_address_here
```

### Step 4: Update `config.json`

Ensure `config.json` contains only the transaction confirmation settings:

```json:config.json
{
    "tx_required_confirmations": 2
}
```

### Step 5: Install Dependencies

Use nvm to set the correct Node.js version and install dependencies:

```bash
nvm use 22
npm install
```

### Step 6: Deploy the Smart Contract

Deploy the smart contract using the following command:

```bash
node 1-deploy.js
```

After deployment, update the `CUSTOM_ERC20_FACTORY_ADDRESS` in your `.env` file with the contract address returned from the deployment.

### Step 7: Interact with the Smart Contract

To interact with the deployed contract, run:

```bash
node 2-onchain-call.js
```

## Further Steps

This project provides a basic setup for deploying and interacting with a custom ERC20 token factory. For more advanced usage and features, refer to the detailed documentation (in development).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.