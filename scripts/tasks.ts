import {task} from "hardhat/config";
import {TASK_COMPILE} from "hardhat/builtin-tasks/task-names";
import { promises as fs } from 'fs';
import path from 'path';

import canonicalize from 'canonicalize';
import {deployEnclave, deployLocal, deployVault} from "./deploy";
import {hardhat} from "viem/chains";
import {formatEther, parseEther, parseGwei} from "viem";
import {waitForTransactionReceipt} from "viem/actions";

const TASK_EXPORT_ABIS = 'export-abis';
task(TASK_COMPILE, async (_args, hre, runSuper) => {
  await runSuper();
  await hre.run(TASK_EXPORT_ABIS);
});

task(TASK_EXPORT_ABIS, async (_args, hre) => {
  const srcDir = path.basename(hre.config.paths.sources);
  const outDir = path.join(hre.config.paths.root, 'abis');

  const [artifactNames] = await Promise.all([
    hre.artifacts.getAllFullyQualifiedNames(),
    fs.mkdir(outDir, { recursive: true }),
  ]);

  await Promise.all(
    artifactNames.map(async (fqn) => {
      const { abi, contractName, sourceName } = await hre.artifacts.readArtifact(fqn);
      if (abi.length === 0 || !sourceName.startsWith(srcDir) || contractName.endsWith('Test'))
        return;
      await fs.writeFile(`${path.join(outDir, contractName)}.json`, `${canonicalize(abi)}\n`);
    }),
  );
});

task('deployEnclave',async (_args, hre)=> {

  if (hre.network.name === 'hardhat' || hre.network.name === 'localhost' || hre.network.name.startsWith('sapphire')) {
    console.log('Deploying enclave');
    await deployEnclave(hre);
  }
  else {
    console.error(`Enclave wallet can not be deployed to "${hre.network.name}". Switch to the Oasis Sapphire.`);
  }
});

task('deployVault')
.addParam('enclaveAddress', 'Contract addresses for the Enclave Wallet')
.addParam('signerAddress', 'Public key address of the enclave wallet signer')
.setAction(async (_args, hre)=> {

  if (hre.network.name === 'hardhat' || hre.network.name === 'localhost' || !hre.network.name.startsWith('sapphire')) {
    console.log('Deploying vault', _args);
    await deployVault(hre, _args.enclaveAddress, _args.signerAddress);
  }
  else {
    console.error(`ChainVault can not be deployed to "${hre.network.name}". Switch to an EVM network`);
  }
});

task('registerSpokeToHub')
.addParam('enclaveAddress', 'Contract addresses for the Enclave Wallet')
.addParam('chainVaultAddress', 'Contract addresses for the Chain Vault')
.addParam('vaultChainId', 'Chain ID for the Chain Vault contract')
.setAction(async (_args, hre)=> {
  const chainId = hre.network.config.chainId;
  if (chainId != 0x5aff) {
    console.error(`A Spoke contract can only be registered to an Hub located on the Sapphire network`);
    return;
  }
  const vaultChainId = Number(_args.vaultChainId);
  if (isNaN(vaultChainId)) {
    console.error(`Invalid spoke chain ID ${_args.vaultChainId}`);
    return;
  }
  const wallet = await hre.viem.getContractAt('EnclaveWallet', _args.enclaveAddress);
  await wallet.write.registerHostChain([BigInt(vaultChainId), _args.chainVaultAddress]);
  console.log('Registered spoke to hub', BigInt(vaultChainId), _args.chainVaultAddress);
});

task('registerEnclaveAddress')
.addParam('enclaveAddress', 'Contract addresses for the Enclave Wallet')
.addParam('chainVaultAddress', 'Contract addresses for the Chain Vault')
.setAction(async (_args, hre)=> {

  const wallet = await hre.viem.getContractAt('Vault', _args.chainVaultAddress);
  const tx = await wallet.write.registerEndpoint([_args.enclaveAddress], { gasPrice: parseGwei('5'), nonce: 65 });
  console.log('Registered enclave to spoke', _args.enclaveAddress, tx);
});

task('registerSigningKey')
.addParam('signerAddress', 'Enclave signer address')
.addParam('chainVaultAddress', 'Contract addresses for the Chain Vault')
.setAction(async (_args, hre)=> {

  const wallet = await hre.viem.getContractAt('Vault', _args.chainVaultAddress);
  const tx = await wallet.write.registerPermitAuthProvider([_args.signerAddress], { gasPrice: parseGwei('5'), nonce: 64 });
  console.log('Registered signer to spoke', _args.signerAddress, tx);
});

task('deployLocal',async (_args, hre)=> {
  await deployLocal(hre);
});


// npx hardhat deployEnclave --network sapphire-testnet
// npx hardhat deployVault --network bsc-testnet --enclave-address 0x6Bbd5eA77a2D8aab8342bb756dB0844A36FA3e13 --signer-address 0x81A6B72dd67763f6C5B57A5eF687cf81C6FA83CF
// npx hardhat registerSpokeToHub --network sapphire-testnet --enclave-address 0x6Bbd5eA77a2D8aab8342bb756dB0844A36FA3e13 --chain-vault-address 0xb62967a648b5300acf52e93777ff2b944c330f33 --vault-chain-id 97
// npx hardhat registerEnclaveAddress --network bsc-testnet --enclave-address 0x0cAF8DC5f52D27997dda47a7aD3a807E04AB6A3B --chain-vault-address 0xb62967a648b5300acf52e93777ff2b944c330f33
// npx hardhat registerSigningKey --network bsc-testnet --signer-address 0x05754A4f0Ba1a117ff39a5d4c641cea7ff5806AB --chain-vault-address 0xb62967a648b5300acf52e93777ff2b944c330f33