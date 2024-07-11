import AmountInput from "./AmountInput.tsx";
import {TokenBalance, tokenMap} from "./types.ts";
import {useEffect, useRef, useState} from "react";
import {formatUnits, parseEther} from "viem";
import {useAccount, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import {useEnclaveService} from "../hooks/useEnclaveService.ts";
import {Button} from "@mantine/core";
import {chainVaultAbi, enclaveWalletAbi} from "../abi.ts";
import {appEnv} from "../appEnv.ts";
import {ConfirmModal} from "./ConfirmModal.tsx";
import {SCSelect} from "./SCSelect.tsx";

type Props = {
  depositBalance?: bigint,
  onChange: () => any,
  refreshIndex: number
};


export function WithdrawAmountInput({ onChange, refreshIndex }: Props) {

  const {getBalance, getWithdrawIntent, error} = useEnclaveService();
  const [selectedToken, setSelectedToken] = useState('bnb');
  const { chain, address } = useAccount();
  const [amountInput, setAmountInput] = useState('');
  // const [hash, setHash] = useState<`0x${string}`>();
  const [validationError, _] = useState('');
  //const [selectedToken, setSelectedToken] = useState('eth');
  const [sapphireBalance, setSapphireBalance] = useState<TokenBalance>();
  const [isPending, setIsPending] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const confirmRef = useRef({ open: () => {} });
  // const selectedToken = 'eth';

  //const ZERO_ADDRESS = '0x' + '0'.repeat(40) as any;
  useEffect(() => {
    console.log("refreshIndex", refreshIndex, appEnv.SAPPHIRE_NETWORK);
    refresh();
  }, [refreshIndex]);

  useEffect(() => {
    if (error) {
      confirmRef.current.open();
    }
  }, [error]);


  const { data: hash, isPending: isWritePending, writeContract } = useWriteContract();
  // const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const onWithdraw = () => {
    console.log("onWithdraw", amountInput);
    setIsPending(true);
    getWithdrawIntent(parseEther(amountInput))
      .then((data) => {
        console.log("getWithdrawIntent", data);
        writeContract({
          chain, account: address,
          abi: chainVaultAbi,
          address: appEnv.CHAIN_VAULT_ADDR,
          functionName: 'withdraw',
          args: [data.intent, data.sig]
        }, {
          onSettled: (data, error) => {
            console.log("onSettled", data, error);
            setIsConfirmed(true);
            onChange();
          }
        })
        setIsPending(false);
      })
    .catch((error) => {
      console.error("onWithdraw", error);
      setIsPending(false);
    });
  }

  const refresh = () => {
    getBalance().then((balance: bigint) => {

      const data = tokenMap[selectedToken].data;
      console.log("balance", formatUnits(balance, data.decimals));
      setSapphireBalance({ decimals: data.decimals, formatted: formatUnits(balance, data.decimals), symbol: data.symbol, value: balance });
    });
  }

  return (
    <div className="flex flex-col gap-6 p-8 w-1/3 h-1/3 bg-neutral-900">
      <div>
        Authorize the Enclave wallet to withdraw assets from the Vault contract to your wallet. When the transaction is confirmed a confirmation message will be sent back to the Enclave wallet and the balanced updated.
      </div>
      <div className="flex gap-3 w-full items-center">
        <AmountInput token={tokenMap[selectedToken]} onValueChange={setAmountInput} balance={sapphireBalance}/> {/*<CustomSelect menuItems={Object.values(tokenMap)} defaultValue="eth" value={selectedToken} onChange={(val) => setSelectedToken(val)}/>*/}
        <SCSelect model={Object.values(tokenMap)} defaultValue="eth" value={selectedToken} onChange={(val) => setSelectedToken(val)} />
      </div>
      <div className="flex gap-2">
        <Button variant="outlined" onClick={() => refresh()}>Refresh</Button>
        <Button variant="contained" className="w-full rounded-full" onClick={onWithdraw} disabled={isPending || !!validationError || Number(amountInput) === 0 || isNaN(Number(amountInput))}>Withdraw</Button>
      </div>
      <div className="flex flex-col gap-1 p-8  bg-neutral-900">
        {hash && <div>Transaction Hash: {hash}</div>} {isPending &&
        <div>Waiting for confirmation...</div>} {isConfirmed && <div>Transaction has been sent.</div>}
      </div>
      <ConfirmModal ref={confirmRef} title="Check your connection" message={error}></ConfirmModal>
    </div>
  )
}