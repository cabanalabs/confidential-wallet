import {
  deployAndApproveERC20,
  deployERC20,
  loadBaseFixture,
  preparePermitWithdraw,
  preparePermitWithdrawToken
} from "./helper";
import hre from "hardhat";
import {expect} from "chai";
import {Hex, parseEther} from "viem";
import {WalletClient, PublicClient, GetContractReturnType} from "@nomicfoundation/hardhat-viem/types";
import {EnclaveWallet$Type} from "../artifacts/contracts/Enclave/EnclaveWallet.sol/EnclaveWallet";
import {ChainVault$Type} from "../artifacts/contracts/ChainVault/ChainVault.sol/ChainVault";
import {hardhat} from "viem/chains";
import {deployLocal} from "../scripts/deploy";
import {privateKeyToAccount} from "viem/accounts";

const ZERO_ADDRESS = '0x' + '0'.repeat(40) as `0x${string}`;

type FixtureType = {
  enclaveContract: GetContractReturnType<EnclaveWallet$Type["abi"]>,
  vaultContract: GetContractReturnType<ChainVault$Type["abi"]>,
  contractOwner: WalletClient,
  userAccount: WalletClient,
  authSigner: WalletClient,
  web3PublicClient: PublicClient
}

const CHAIN_ID = BigInt(hardhat.id);

const mockSigningAccount = privateKeyToAccount('0xf4b088aa0b42936aea20dd519a4f7c365124a3a1d1cc9112a2ab7ef614d10a75');

describe("ChainVault", function () {

  let fixture: FixtureType;
  let enclaveAddress:`0x${string}`
  let vaultAddress: `0x${string}`

  before(async () => {
    [enclaveAddress, vaultAddress] = await deployLocal();
    await deployERC20();

    const {  contractOwner, userAccount, authSigner, web3PublicClient } = await loadBaseFixture();
    const enclaveContract = await hre.viem.getContractAt('EnclaveWallet', enclaveAddress);
    const vaultContract = await hre.viem.getContractAt('ChainVault', vaultAddress);

    fixture = { enclaveContract, vaultContract, contractOwner, userAccount, authSigner, web3PublicClient };
  })


  function getEnclaveTokenBalance(sender: Hex, tokenAddress: Hex) {
    return fixture.enclaveContract.read.getTokenBalance([CHAIN_ID, sender, tokenAddress]);
  }

  describe("Signing Key", function () {
    it("Should have a signing key", async function () {
      const {contractOwner} = fixture;

      const enclaveContractAsFacet = await hre.viem.getContractAt('CryptoFacet', enclaveAddress, {client: {wallet: contractOwner}});

      const address = await enclaveContractAsFacet.read.getSignerAddress();

      expect(address).to.equal(mockSigningAccount.address);
    });
  });

  describe("Deposits", function () {

    //
    // User initiates a deposit with the Vault smart contract
    //
    it("Should depositETH by interacting with Vault contract", async function () {
      const {userAccount} = fixture;
      const amount = parseEther("10");

      const beforeAmount = await getEnclaveTokenBalance(userAccount.account.address, ZERO_ADDRESS);
      console.log('beforeAmount', beforeAmount, 'amount', amount);

      const userAccountConnectedToChainVault = await hre.viem.getContractAt('ChainVault', vaultAddress, {client: {wallet: userAccount}});
      await userAccountConnectedToChainVault.write.deposit({value: amount});

      expect(await getEnclaveTokenBalance(userAccount.account.address, ZERO_ADDRESS)).to.be.equal(beforeAmount + amount);
    })

    //
    //   User sends ETH directly to smart contract address.
    //
    it("Should receiveETH when user transfers directly to contract address", async function () {
      const {enclaveContract, vaultContract, userAccount, web3PublicClient} = fixture;
      const beforeAmount = await getEnclaveTokenBalance(userAccount.account.address, ZERO_ADDRESS);
      const amount = parseEther("10");

      console.log('beforeAmount', beforeAmount, 'amount', amount);

      const hash = await userAccount.sendTransaction({
        to: vaultAddress,
        value: amount,
      });
      await web3PublicClient.waitForTransactionReceipt({hash});

      expect(await getEnclaveTokenBalance(userAccount.account.address, ZERO_ADDRESS)).to.be.equal(beforeAmount + amount);
    })

    it("Should deposit token by interacting with Vault contract", async function () {
      const {userAccount} = fixture;
      const amount = 1000n;

      const erc20 = await deployAndApproveERC20(userAccount, vaultAddress, amount);
      const userAccountConnectedToChainVault = await hre.viem.getContractAt('ChainVault', vaultAddress, {client: {wallet: userAccount}});
      await userAccountConnectedToChainVault.write.depositToken([erc20.address, amount]);

      expect(await getEnclaveTokenBalance(userAccount.account.address, erc20.address)).to.equal(amount);
      expect(await erc20.read.balanceOf([userAccount.account.address])).to.equal(0n);
      expect(await erc20.read.balanceOf([vaultAddress])).to.equal(amount);
    })
    //*/

  });
  // /*
    describe("Withdraws", function () {

      it("Should withdraw ETH", async function () {
        const {enclaveContract, vaultContract, contractOwner, userAccount, web3PublicClient}  = fixture;
        const amount = parseEther("10");
        const userAddress = userAccount.account.address;
        const beforeAmount = await getEnclaveTokenBalance(userAddress,ZERO_ADDRESS);

        const userAccountConnectedToChainVault = await hre.viem.getContractAt('ChainVault', vaultAddress, { client: { wallet: userAccount } });
        const userAccountConnectedToEnclave = await hre.viem.getContractAt('EnclaveWallet', enclaveAddress);
        const { permit, localSignerSig} = await preparePermitWithdraw(mockSigningAccount, userAddress, vaultAddress, amount);

        let signature = await userAccountConnectedToEnclave.read.signWithdrawIntent([permit, CHAIN_ID, vaultAddress], { account: userAddress });

        if (signature === "0xdeadbeef") {
          console.warn('Unable to generate signature from mock contract, using local signer instead');
          signature = localSignerSig;
        }

        await userAccountConnectedToChainVault.write.withdraw([permit, signature]);

        expect(await getEnclaveTokenBalance(userAddress, ZERO_ADDRESS)).to.be.equal(beforeAmount - amount);
      })

      it("Should withdraw token - user pays gas", async function () {
        const {userAccount}  = fixture;
        const amount = 1000n;

        const erc20 = await deployERC20();
        const userAddress = userAccount.account.address;
        const beforeAmount = await getEnclaveTokenBalance(userAddress, erc20.address);

        const userAccountConnectedToChainVault = await hre.viem.getContractAt('ChainVault', vaultAddress, { client: { wallet: userAccount } });
        const userAccountConnectedToEnclave = await hre.viem.getContractAt('EnclaveWallet', enclaveAddress);

        const { permit, localSignerSig} = await preparePermitWithdrawToken(mockSigningAccount, userAddress, vaultAddress, amount, erc20.address);

        let signature = await userAccountConnectedToEnclave.read.signWithdrawTokenIntent([permit, CHAIN_ID, vaultAddress], { account: userAddress });

        if (signature === "0xdeadbeef") {
          console.warn('Unable to generate signature from mock contract, using local signer instead');
          signature = localSignerSig;
        }

        await userAccountConnectedToChainVault.write.withdrawToken([permit, signature]);

        expect(await getEnclaveTokenBalance(userAddress, erc20.address)).to.be.equal(beforeAmount - amount);
        expect(await erc20.read.balanceOf([userAddress])).to.equal(amount);
        expect(await erc20.read.balanceOf([vaultAddress])).to.equal(0n);
      })

    });
    //*/
});