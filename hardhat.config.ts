import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "./scripts/tasks";

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: { enabled: !process.env.DEBUG, runs: 200 },
          viaIR: false
        }
      },
      { version: '0.8.17' },
    ]
  },
  networks: {
    hardhat: {
      chainId: 31_337
    },
    sepolia: {
      url: 'https://ethereum-sepolia.blockpi.network/v1/rpc/public', //https://rpc.sepolia.org', 'https://eth-sepolia.g.alchemy.com/v2/demo', 'https://ethereum-sepolia.publicnode.com'
      chainId: 11155111,
      accounts,
    },
    'bsc-testnet': {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      accounts,
    },
    'sapphire-testnet': {
      url: 'https://testnet.sapphire.oasis.dev',
      chainId: 0x5aff,
      accounts,
    },
  }

};

export default config;
