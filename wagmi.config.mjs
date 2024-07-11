import { defineConfig } from '@wagmi/cli'
// @ts-ignore
import erc20Json from './abis/ERC20Mock.json';
import cryptoJson from './abis/CryptoFacet.json';
import pvJson from './abis/ChainVault.json';
import pwJson from './abis/EnclaveWallet.json';

export default defineConfig({
  out: './frontend/src/abi.ts',
  contracts: [
    {
      name: 'ChainVault',
      abi: pvJson,
    },
    {
      name: 'EnclaveWallet',
      abi: pwJson,
    },
    {
      name: 'CryptoFacet',
      abi: cryptoJson,
    },
    {
      name: 'ERC20',
      abi: erc20Json,
    }
  ],
  plugins: [],
})
