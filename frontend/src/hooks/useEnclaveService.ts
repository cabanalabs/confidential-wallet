
import {
  createPublicClient,
  formatEther,
  type Hex,
  http, maxUint256,
  type PublicClient,
} from "viem";
import {appEnv} from "../appEnv.ts";
import {enclaveWalletAbi, chainVaultAbi, cryptoFacetAbi} from "../abi.ts";
import {useRecoilState} from "recoil";
import {sessionAtom, SessionModel} from "../atoms/session-atom.ts";
import {useEffect, useState} from "react";
import {useAccount, useReadContract} from "wagmi";
import { secp256k1 } from '@noble/curves/secp256k1'
import {randomBytes} from "crypto";
import {hardhat, sapphireTestnet} from "viem/chains";

//

let enclaveRead: PublicClient;
// let enclaveWrite: WalletClient;
let signerAddress: Hex;

export function useEnclaveService  () {
  const {chain: destinationChain, address: recipientAddress} = useAccount();
  const [sessionObj, setSessionObj] = useRecoilState<SessionModel>(sessionAtom);
  const [error, setError] = useState('');


  // const busFee = useReadContract({
  //   address: appEnv.CHAIN_VAULT_ADDR,
  //   abi: chainVaultAbi,
  //   functionName: 'estimateIOFee',
  //   args: []
  // });

  useEffect(() => {
    if (destinationChain && recipientAddress) {
      if (sessionObj.chainId !== destinationChain.id || sessionObj.address !== recipientAddress) {
        console.log("chain", destinationChain.name);
        setSessionObj({
          ...sessionObj,
          chainId: destinationChain.id,
          address: recipientAddress,
          chainName: destinationChain.name
        });
        updateChains();
      }
    }
  }, [destinationChain, recipientAddress])

  async function updateChains() {

    const sapphireChain = appEnv.SAPPHIRE_NETWORK === 'localnet' ? hardhat : sapphireTestnet

    //@ts-ignore
    //TODO - point to Sapphire testnet
    enclaveRead = createPublicClient({ chain: sapphireChain, transport: http() })

    // const account = privateKeyToAccount(appEnv.DEPLOYER_SECRET);
    // enclaveWrite = createWalletClient({ account: account, chain: sapphireChain, transport: http()});
    //
    // await enclaveWrite.writeContract({
    //   account,
    //   chain: destinationChain,
    //   address: appEnv.ENCLAVE_WALLET_ADDR,
    //   abi: cryptoFacetAbi,
    //   functionName: 'rotateSigningKey',
    //   args: []
    // });

    try {
      signerAddress = await enclaveRead.readContract({
        address: appEnv.ENCLAVE_WALLET_ADDR,
        abi: cryptoFacetAbi,
        functionName: 'getSignerAddress',
        args: []
      });

      console.log('signerAddress', signerAddress);

      if (signerAddress === "0x0000000000000000000000000000000000000000") {
        console.error('Signer address not found');
      }
    }
    catch(e) {
      setError(`Unable to connect to the Enclave smart contracts on "${appEnv.SAPPHIRE_NETWORK}"`);
    }
  }

  async function getBalance() {

    console.log('getBalance', appEnv.ENCLAVE_WALLET_ADDR, recipientAddress);

    try {
      const result = await enclaveRead.readContract({
        address: appEnv.ENCLAVE_WALLET_ADDR,
        abi: enclaveWalletAbi,
        functionName: 'getBalance',
        args: [BigInt(destinationChain.id), recipientAddress]
      });

      console.log('connected', formatEther(result));

      return result;
    }
    catch(e) {
      return 0n;
    }
  }

  async function getTokenBalance(asset: Hex) {

    const result = await enclaveRead.readContract({
      address: appEnv.ENCLAVE_WALLET_ADDR,
      abi: enclaveWalletAbi,
      functionName: 'getTokenBalance',
      args: [BigInt(destinationChain.id), recipientAddress, asset]
    })

    console.log('connected', formatEther(result));

    return result;
  }

  const getWithdrawIntent = async (amount: bigint) => {

    const nonce = randomBytes(24).toString('hex');
    console.log('nonce', nonce);
    const intent = { signer: signerAddress, amount, recipient: recipientAddress, nonce: BigInt('0x' + nonce), deadline: maxUint256 };
    console.log('intent', intent);
    const options = {
      account: recipientAddress,
      address: appEnv.ENCLAVE_WALLET_ADDR,
      abi: enclaveWalletAbi,
      functionName: 'signWithdrawIntent',
      args: [intent, BigInt(destinationChain.id), appEnv.CHAIN_VAULT_ADDR]
    } as const;

    let sig = await enclaveRead.readContract(options);

    console.log('intent.sig', sig);

    return {intent, sig};
  }

  return {
    error,
    getBalance,
    getTokenBalance,
    getWithdrawIntent
  }

}
