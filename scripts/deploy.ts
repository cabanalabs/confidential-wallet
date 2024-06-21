/* eslint prefer-const: "off" */

import {Hex} from "viem";
import hre from "hardhat";
import {hardhat} from "viem/chains";

export async function deployLocal () {
  const {signerAddress, enclaveAddress} = await deployEnclave();
  console.log('')
  const chainVaultAddress = await deployChainVault(enclaveAddress, signerAddress);

  const wallet = await hre.viem.getContractAt('EnclaveWallet', enclaveAddress);
  await wallet.write.registerHostChain([BigInt(hardhat.id), chainVaultAddress]);

  //await deployErc20();
  return [enclaveAddress, chainVaultAddress];
}

export async function deployErc20 () {
  const [signer] = await hre.viem.getWalletClients();
  const signerAddr = signer.account.address;
  const erc20 = await hre.viem.deployContract("ERC20Mock",["ERC20Mock","EM"]);
  await erc20.write.mint([signerAddr, 100n*(10n**18n)]);
  console.log('')
  console.log('erc20 MintTo:', signerAddr, 'Token:', erc20.address);
}

export async function deployEnclave() {

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

  console.log('Signer Address:', signerAddress, 'Enclave Address:', enclave.address);

  return {signerAddress, enclaveAddress: enclave.address};
}

export async function deployChainVault (walletAddr: string, signerAddress: string) {

  const initArgs  = {
    enclaveEndpoint: walletAddr,
    signerAddress
  }

  const chainVault = await hre.viem.deployContract('ChainVault', [initArgs]);

  return chainVault.address;
}
