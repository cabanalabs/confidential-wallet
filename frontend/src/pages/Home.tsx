
import {DepositAmountInput} from "../components/DepositAmountInput.tsx";
import {tokenMap} from "../components/types.ts";
import {WithdrawAmountInput} from "../components/WithdrawAmountInput.tsx";
import {useState} from "react";

export const Home = () => {

  const [balanceChange, setBalanceChange] = useState(0);

  return (
    <section className="mt-5 flex flex-col items-center gap-10">
      <DepositAmountInput token={tokenMap['bnb']} onChange={() => setBalanceChange(balanceChange+1)} refreshIndex={balanceChange} />
      <WithdrawAmountInput onChange={() => setBalanceChange(balanceChange+1)} refreshIndex={balanceChange} />
    </section>
  );
}