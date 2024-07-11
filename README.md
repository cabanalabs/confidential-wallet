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

Run the frontend against the testnet deployment
```sh
cd frontend
yarn dev
```

Get BNB testnet tokens from the [BNB Faucet](https://www.bnbchain.org/en/testnet-faucet)

## Testnet Deployment

### Prerequisite
The Oasis Privacy Layer (OPL) requires an Executor to run on Testnet. Follow the Celer integration [guide](https://im-docs.celer.network/developer/development-guide/message-executor/integration-guide#executor) to setup.

For reference here is the configuration used for our testnet deployment:

```toml
[[service.contracts]]
chain_id = 97 # Bsc testnet
address = "0xb62967a648b5300acf52e93777ff2b944c330f33"
allow_sender_groups = ["wallet"]
[[service.contracts]]
chain_id = 23295 # Sapphire testnet
address = "0x0cAF8DC5f52D27997dda47a7aD3a807E04AB6A3B"
allow_sender_groups = ["wallet"]

[[service.contract_sender_groups]]
name = "wallet" 
allow = [
  { chain_id = 97, address = "0xb62967a648b5300acf52e93777ff2b944c330f33" },
  { chain_id = 23295, address = "0x0cAF8DC5f52D27997dda47a7aD3a807E04AB6A3B" },
]
``` 

### Setup
Prepare your hex-encoded private key and store it as an environment variable:

```shell
export PRIVATE_KEY=0x...
```

STEP #1 - Deploy the EnclaveWallet contract to the Sapphire Testnet using the following command:

```shell
npx hardhat deploy --network sapphire-testnet
```

Take note of the contract addresses in the response. You will need them in the next step

**Signer Address**: 0x1234 **Enclave Address**: 0x1234

STEP #2 - Deploy the ChainVault contract to the BSC Testnet using the following command (replace the enclave and signer addresses with the ones from the previous step):

```shell
npx hardhat deployVault --network bsc-testnet --signer-address 0x1234 --enclave-address 0x1234 
```

STEP #3 - Register the BSC chain vault address with the EnclaveWallet contract using the following command:

```shell
npx hardhat registerSpokeToHub --network sapphire-testnet --enclave-address 0x1234 --chain-vault-address 0x1234 --vault-chain-id 97
```


## References
The following open source projects were utilized for the development of this proof-of-concept.

### Uniswap Permit2

Inspiration was taken from Uniswap's [EIP712](https://github.com/Uniswap/permit2/blob/cc56ad0f3439c502c246fc5cfcc3db92bb8b7219/src/EIP712.sol) implementation. It was refactored it to support signing messages on one chain and verifying them on another.

Also Uniswap's implementation of [unorderedNonces](https://github.com/Uniswap/permit2/blob/cc56ad0f3439c502c246fc5cfcc3db92bb8b7219/src/SignatureTransfer.sol#L150) was chosen for replay protection.

### Oasis Privacy Layer
[OPL](https://github.com/oasisprotocol/sapphire-paratime/blob/main/contracts/contracts/opl/Endpoint.sol) is a message bus that allows for secure communication between the Sapphire and remote chains.

It has been refactored to support multiple chains sending messages to the same Sapphire smart contract.

## Security
This code was developed for the purpose of a proof-of-concept. It should be considered experimental and not production ready.


## License

This project is licensed under the Apache License 2.0 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Thanks to the [Oasis Protocol Foundation](https://oasisprotocol.org/) for [Sapphire](https://oasisprotocol.org/sapphire) and the [Oasis Privacy Layer (OPL)](https://oasisprotocol.org/opl).