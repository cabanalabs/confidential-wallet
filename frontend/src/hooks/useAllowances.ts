
import {Address, maxUint256} from "viem";

type Props = {
  takerAddress: Address;
  sellTokenAddress: Address;
};

export async function useAllowance ({ takerAddress, sellTokenAddress }: Props) {
  // 1. Read from ERC20 contract. Does spender (0x Exchange Proxy) have an allowance?
  /*const {data: allowance, refetch} = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [takerAddress, exchangeProxy],
  });

  // 2. (Only if no allowance): Write to ERC20, approve 0x Exchange Proxy to spend max integer
  const config = usePrepareTransactionRequest({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [exchangeProxy, maxUint256],
  });

  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    error,
  } = useWriteContract(config);

  const {isLoading: isApproving} = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess(data) {
      refetch();
    },
  });*/
}