# Custom QRC20 Factory Project

## Overview

This project demonstrates the deployment and interaction with a custom QRC20 token factory on the QRL v2 (post-quantum) blockchain. The factory allows for the creation of QRC20 tokens with customizable parameters (name, symbol, supply, decimals, max supply, max wallet amount, max tx limit, owner).

## Prerequisites

- Node.js 22 (managed via [nvm](https://github.com/nvm-sh/nvm))
- npm
- Access to a QRL v2 JSON-RPC node (the node exposes the `qrl_*` RPC namespace)
- A funded QRL Dilithium (MLDSA87) wallet — 36-word mnemonic

## Setup

### Step 1: Obtain access to a QRL v2 node

Either run your own QRL v2 node or use a public testnet RPC endpoint. See [https://test-zond.theqrl.org/install](https://test-zond.theqrl.org/install) for current node install instructions.

### Step 2: Create a QRL Dilithium wallet & obtain testnet QRL

Use the [wallet creation instructions](https://test-zond.theqrl.org/creating-wallet) to create a wallet and note the Q-prefixed Dilithium public address. Obtain testnet QRL via the [QRL Discord](https://www.theqrl.org/discord).

### Step 3: Configure environment variables

Create a `.env` file in the root directory. Use `.env.example` as a template:

```
RPC_URL=http://127.0.0.1:8545
MNEMONIC=your_mnemonic_here
CUSTOM_ERC20_FACTORY_ADDRESS=your_factory_contract_address_here
CUSTOM_ERC20_ADDRESS=your_token_contract_address_here
```

> Env variable names are kept as `CUSTOM_ERC20_*` for backwards compatibility with downstream tooling; the deployed contracts are QRC20 tokens on QRL v2.

### Step 4: Confirm `config.json`

```json
{
    "tx_required_confirmations": 2
}
```

### Step 5: Install dependencies

```bash
nvm use 22
npm install
```

### Step 6: Deploy the factory contract

```bash
node 1-deploy.js
```

After deployment, update `CUSTOM_ERC20_FACTORY_ADDRESS` in your `.env` with the Q-prefixed contract address printed on receipt.

### Step 7: Create a QRC20 token via the factory

```bash
node 2-onchain-call.js
```

This calls `createToken(...)` on the factory with the default parameters defined at the top of `2-onchain-call.js` (edit them as needed). The new token address is logged in the receipt.

### Step 8: Read token info off-chain

```bash
node 3-offchain-call.js
```

Reads `name`, `symbol`, `decimals`, `totalSupply`, and the balance for `HOLDER_ADDRESS` on the token at `CUSTOM_ERC20_ADDRESS`.

## v2 compatibility notes

- Uses `@theqrl/web3 ^0.4.0` with the `qrl` namespace (`web3.qrl.*`) — legacy `web3.zond.*` calls will fail against a v2 node.
- Seed derivation uses `@theqrl/wallet.js ^3.0.1` (`MLDSA87.newWalletFromMnemonic(...).getHexExtendedSeed()`).
- All contract and account addresses on v2 are **Q-prefixed**.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
