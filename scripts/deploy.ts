/* eslint prefer-const: "off" */

import {Hex} from "viem";
// import hre from "hardhat";
import {hardhat} from "viem/chains";
import {HardhatRuntimeEnvironment} from "hardhat/types";

export async function deployLocal(hre: HardhatRuntimeEnvironment) {
  const {signerAddress, enclaveAddress} = await deployEnclave(hre);
  console.log('')
  const chainVaultAddress = await deployVault(hre, enclaveAddress, signerAddress);

  const wallet = await hre.viem.getContractAt('EnclaveWallet', enclaveAddress);
  await wallet.write.registerHostChain([BigInt(hardhat.id), chainVaultAddress]);

  //await deployErc20();
  return [enclaveAddress, chainVaultAddress];
}

export async function deployErc20 (hre: HardhatRuntimeEnvironment) {
  const [signer] = await hre.viem.getWalletClients();
  const signerAddr = signer.account.address;
  const erc20 = await hre.viem.deployContract("ERC20Mock",["ERC20Mock","EM"]);
  await erc20.write.mint([signerAddr, 100n*(10n**18n)]);
  console.log('')
  console.log('erc20 MintTo:', signerAddr, 'Token:', erc20.address);
}

export async function deployEnclave(hre: HardhatRuntimeEnvironment) {

  let cryptoFacetAddress: Hex;
  let signerAddress: Hex;

  if (hre.network.name === 'hardhat' || hre.network.name === 'localhost') {
    const contract = await hre.viem.deployContract('CryptoFacetMock');
    signerAddress = await contract.read.getSignerAddress();
    cryptoFacetAddress = contract.address;
  }
  else {
    const contract = await hre.viem.deployContract('CryptoFacet');
    signerAddress = await contract.read.getSignerAddress();
    cryptoFacetAddress = contract.address;

  }

  const enclave = await hre.viem.deployContract('EnclaveWallet', [cryptoFacetAddress]);

  console.log('Enclave Address:', enclave.address, 'Signer Address:', signerAddress);

  return {signerAddress, enclaveAddress: enclave.address};
}

export async function deployVault (hre: HardhatRuntimeEnvironment, walletAddr: string, signerAddress: string) {

  const initArgs  = {
    enclaveEndpoint: walletAddr,
    signerAddress
  }

  const chainVault = await hre.viem.deployContract('Vault', [initArgs]);

  console.log('ChainVault Address:', chainVault.address);

  return chainVault.address;
}
