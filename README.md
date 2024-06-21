# confidential-wallet

Leverage the Confidential VM of Oasis Sapphire to manage assets on EVM chains.

## Overview

Our Confidential Wallet proof-of-concept is made up of the following components:

### Enclave Wallet 
A Sapphire smart contract that functions as a confidential ledger, keeping track of all assets and balances for each user.

### Chain Vault 
A smart contract on a EVM-compatible chain. This is where the native assets are stored. The Chain Vault is responsible for accepting deposits,  verifying withdraw Intents and notifying the Enclave wallet of transaction confirmations via the OPL Message Bus.

### OPL - Oasis Privacy Layer
This message bus is used to send transaction confirmations from EVM chains to the Enclave Wallet.


## Local Development

Use [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#overview) and [Hardhat-deploy](https://github.com/wighawag/hardhat-deploy) for development.

### Setup

Install dependencies
```sh
yarn install
```

Compile contracts
```sh   
yarn compile
```

Run tests
```sh
yarn test
```


## References
The following open source projects were utilized for the development of this proof-of-concept.

### Uniswap Permit2

Inspiration was taken from Uniswap's [EIP712](https://github.com/Uniswap/permit2/blob/cc56ad0f3439c502c246fc5cfcc3db92bb8b7219/src/EIP712.sol) implementation. It was refactored it to support signing messages on one chain and verifying them on another.

Also Uniswap's implementation of [unorderedNonces](https://github.com/Uniswap/permit2/blob/cc56ad0f3439c502c246fc5cfcc3db92bb8b7219/src/SignatureTransfer.sol#L150) was chosen for replay protection.

### Oasis Privacy Layer
[OPL](https://github.com/oasisprotocol/sapphire-paratime/blob/main/contracts/contracts/opl/Endpoint.sol) is a message bus that allows for secure communication between the Sapphire and remote chains.

It has been refactored to support multiple chains sending messages to the same Sapphire smart contract. 