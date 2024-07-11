import "dotenv/config";
import {
  bytesToBigInt, Chain,
  createPublicClient,
  encodeAbiParameters,
  encodePacked,
  formatEther, type Hex,
  hexToBytes,
  http,
  keccak256, maxUint256, parseEther
} from "viem";
import {bscTestnet, hardhat} from "viem/chains";
import {messageBusGateway} from "./messageBusGateway.js";
import * as chains from 'viem/chains'

import {celerMessageBusAbi, hostVaultAbi} from "../abi.ts";



const busContractAddress = '0x95714818fdd7a5454F73Da9c777B3ee6EbAEEa6B';

function getChainById(id: number):Chain {
  return Object.values(chains).find(x => x.id === id) as any
}

function estimateFee(msgLen: bigint, feeBase: bigint, feePerByte: bigint) {
  return feeBase + msgLen * feePerByte;
}

function estimateBusFee(user: `0x${string}`, amount: bigint, feeBase: bigint, feePerByte: bigint) {

  const txSeq = 0n;
  const message = encodeAbiParameters(
    [
      { name: 'x', type: 'address' },
      { name: 'y', type: 'address' },
      { name: 'z', type: 'uint' }
    ],
    ["0x64544969ed7EBf5f083679233325356EbE738930", user, amount]
  );
  const hash = keccak256(Buffer.from("deposit", "utf8")).slice(0,10) as `0x${string}`
  console.log('hash', hash)
  const envelope = encodePacked(
    ["bytes4","uint","bytes"],
    [hash, txSeq, message]
  );

  return estimateFee(BigInt(hexToBytes(envelope).length), feeBase, feePerByte);
}

async function checkFee(name: string, chainId: number, address: `0x${string}`) {

  const chain = getChainById(chainId);

  if (!chain) {
    console.error('chain not found', name, chainId, address);
    return { feeBase: 0n, feePerByte: 0n };
  }

  const client = createPublicClient({
    chain,
    transport: http(),
  })

  try {
    const feeBase = await client.readContract({
      address,
      abi: celerMessageBusAbi,
      functionName: 'feeBase',
      args: []
    }) as bigint;


    const feePerByte = await client.readContract({
      address,
      abi: celerMessageBusAbi,
      functionName: 'feePerByte',
      args: []
    }) as bigint;

    console.log(name, formatEther(feeBase), formatEther(feePerByte));

    return { feeBase, feePerByte };
  }
  catch (e) {
    console.error(name, e);
    return { feeBase: 0n, feePerByte: 0n };
  }

}

async function checkLocalFee(hostVaultAddress: Hex) {
  const client = createPublicClient({
    chain: hardhat,
    transport: http(),
  })
  const fee = await client.readContract({
    address: hostVaultAddress,
    abi: hostVaultAbi,
    functionName: 'estimateIOFee',
    args: []
  }) as bigint;

  console.log('Local Fee', formatEther(fee));

  return fee;
}

async function checkChainFee(name: string) {
  const chainId = messageBusGateway.chainName2ChainId(name);
  const address = messageBusGateway.getChainConfig(chainId);
  // const { feeBase, feePerByte } = await checkFee(name, chainId, address);
  const feeBase = parseEther('0.000015');
  const feePerByte = parseEther('0.00000015')
  console.log(name, 'Fee Base', feeBase, 'Fee Per Byte', feePerByte);
  const fee = estimateBusFee('0x64544969ed7EBf5f083679233325356EbE738930', 0n, feeBase, feePerByte);
  console.log(name, 'Fee', formatEther(fee));
}

// for (const chain of messageBusGateway.chainListByName) {
//   await checkChainFee(chain);
// }

checkChainFee(messageBusGateway.chainListByName[4]);
checkLocalFee('0x64544969ed7EBf5f083679233325356EbE738930');