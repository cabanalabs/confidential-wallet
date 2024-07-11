import AmountInput from "./AmountInput.tsx";
import {Token, tokenMap} from "./types.ts";
import {useEffect, useMemo, useState} from "react";
import {parseEther, parseUnits} from "viem";
import {
  useAccount,
  useBalance, useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import {useQueryClient} from "@tanstack/react-query";
import {appEnv} from "../appEnv.ts";
import {chainVaultAbi} from "../abi.ts";
import {Button} from "@mantine/core";
import {SCSelect} from "./SCSelect.tsx";


type Props = {
  token?: Token,
  onChange: () => any,
  refreshIndex?: number
};

export function DepositAmountInput({ onChange, refreshIndex }: Props) {

  const [amountInput, setAmountInput] = useState('');
  const [validationError, _] = useState('');
  const [selectedToken, setSelectedToken] = useState('bnb');

  const account = useAccount()
  const { data:balance, queryKey}  = useBalance({address: account.address, token: tokenMap[selectedToken].data.address});

  const busFee = useReadContract({
    address: appEnv.CHAIN_VAULT_ADDR,
    abi: chainVaultAbi,
    functionName: 'estimateIOFee',
    args: []
  });
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const queryClient = useQueryClient()
  // const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
      queryClient.invalidateQueries({queryKey})
    console.log("DepositAmountInput.useEffect", balance);
      onChange();
  }, [isConfirmed, queryClient])

  useMemo(() => {
    if (refreshIndex) {
      queryClient.invalidateQueries({queryKey})
    }
  }, [refreshIndex, queryClient, queryKey])

  const onDeposit = () => {
    console.log("onDeposit", amountInput, selectedToken, busFee.data, appEnv.CHAIN_VAULT_ADDR);

    if (selectedToken === 'bnb') {
      writeContract({
        account: undefined,
        chain: undefined,
        address: appEnv.CHAIN_VAULT_ADDR,
        abi: chainVaultAbi,
        functionName: 'deposit',
        args: [],
        value: parseEther(amountInput) + busFee.data
      });
    }
    else {
      const tokenData = tokenMap[selectedToken].data;
      writeContract({
        account: undefined,
        chain: undefined,
        address: appEnv.CHAIN_VAULT_ADDR,
        abi: chainVaultAbi,
        functionName: 'depositToken',
        args: [tokenData.address, parseUnits(amountInput,tokenData.decimals)]
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-1/3 h-1/3 bg-neutral-900">
      <div>
        Deposit assets from your wallet to the Vault contract. The Enclave wallet will receive a cross-chain message to update your balance accordingly. Click the "refresh" button below after the Executor has confirmed the message.
      </div>
      <div className="flex gap-3 w-full items-center">
        <AmountInput token={tokenMap[selectedToken]} onValueChange={setAmountInput} balance={balance}/>
        <SCSelect model={Object.values(tokenMap)} defaultValue="eth" value={selectedToken} onChange={(val) => setSelectedToken(val)} />
      </div>
      <div>
        <Button variant="contained" className="w-full rounded-full" onClick={onDeposit} disabled={isPending || !!validationError}>Deposit</Button>
      </div>
      <div className="flex flex-col w-full gap-1 p-8 h-1/3 bg-neutral-900">
        {hash && <div>Transaction Hash: {hash}</div>} {isConfirming && <div>Waiting for confirmation...</div>} {isConfirmed && <div>Transaction confirmed.</div>}
      </div>
    </div>
  )
}