import hre from "hardhat";
import {GetContractReturnType, WalletClient} from "@nomicfoundation/hardhat-viem/types";
import {hashTypedData, Hex, maxUint256, PrivateKeyAccount} from "viem";
import {intentWithdrawBuilder} from "./intents/withdrawIntent";
import {ERC20Mock$Type} from "../artifacts/contracts/shared/mocks/ERC20Mock.sol/ERC20Mock";

let deployedErc20: GetContractReturnType<ERC20Mock$Type["abi"]> | undefined;

export async function loadBaseFixture() {

  const [contractOwner, userAccount, authSigner] = await hre.viem.getWalletClients();
  const web3PublicClient = await hre.viem.getPublicClient();

  return {
    contractOwner,
    userAccount,
    authSigner,
    web3PublicClient,
  };
}

export async function deployERC20() {
  if (!deployedErc20) {
    deployedErc20 = await hre.viem.deployContract("ERC20Mock", ["ERC20Mock", "EM"]);
  }
  return deployedErc20;
}

export async function deployAndApproveERC20(userAccount: WalletClient, spender: `0x${string}`, amount:bigint) {
  const erc20 = await deployERC20();
  const userAccountConnectedToContract = await hre.viem.getContractAt('ERC20Mock', erc20.address, { client: { wallet: userAccount } });
  await erc20.write.mint([userAccount.account.address, amount]);
  await userAccountConnectedToContract.write.approve([spender, maxUint256]);
  return erc20;
}

export  async function preparePermitWithdraw(signer: PrivateKeyAccount, recipient: Hex, permitAddress: Hex, amount:bigint, chainId: number) {

  const permit = {
    signer: signer.address,
    amount,
    recipient,
    nonce: 1n,
    deadline: maxUint256
  };

  const {domain, types, values} = intentWithdrawBuilder.getWithdrawIntentData(permit, permitAddress, chainId);
  const data = {domain: domain, types, message: { ...values }, primaryType: 'Withdraw'};
  //console.log(data);
  let signature = await signer.signTypedData(data);

  //console.log('preparePermitWithdraw', hashTypedData(data), signature, permit);

  // return {permit, signature};
  return {permit, hash: hashTypedData(data), localSignerSig: signature}
}

export  async function preparePermitWithdrawToken(signer: PrivateKeyAccount, recipient: Hex, permitAddress: Hex, amount:bigint, token: Hex, chainId: number) {

  const permit = {
    signer: signer.address,
    recipient,
    nonce: 2n,
    deadline: maxUint256,
    //permitted: {
    token,
    amount
    //}
  };

  const {domain, types, values} = intentWithdrawBuilder.getWithdrawTokenIntentData(permit, permitAddress, chainId);
  const data = {domain: domain, types, message: { ...values }, primaryType: 'WithdrawToken'};
  //console.log(data);
  let signature = await signer.signTypedData(data);

  // console.log('preparePermitWithdrawToken', hashTypedData(data), signature, permit);

  // return {permit, signature};
  return {permit, hash: hashTypedData(data), localSignerSig: signature}
}