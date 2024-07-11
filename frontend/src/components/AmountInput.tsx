import styled from "@emotion/styled";
import {useEffect, useState} from "react";
import {formatUnits} from "viem";
import {Token} from "./types.ts";

type Props = {
  balance?: {
   decimals: number; formatted: string; symbol: string; value: bigint;
  };
  amountInput?: string;
  parsedAmountInput?: bigint;
  token: Token
  onValueChange: (input: string) => void;
  // onClickMaxBalance: () => void;
  // validationError: string
};

export enum AmountInputError {
  INSUFFICIENT_BALANCE = "insufficient_balance",
  AMOUNT_TOO_LOW = "amount_too_low",
  INVALID = "invalid",
  NONE = ""
}
export function AmountInput({ token, onValueChange, balance }: Props) {

  const [amountInput, setAmountInput] = useState("0.0");
  const [validationError, setValidationError] = useState<AmountInputError>();
  const [displayBalance, setDisplayBalance] = useState(false);
  const [didEnter, setDidEnter] = useState(false);

  const onChangeAmountInput = (val: string) => {

    if(Number(val) > Number(balance.formatted)) {
      setValidationError(AmountInputError.INSUFFICIENT_BALANCE)
    }
    else if(Number(val) < 0) {
      setValidationError(AmountInputError.AMOUNT_TOO_LOW)
    }
    else {
      setAmountInput(val);
      setValidationError(AmountInputError.NONE);
      onValueChange(val);
    }

    console.log("onChangeAmountInput", val, amountInput, balance);
  };

  const onClickMaxBalance = () => {
    setValidationError(AmountInputError.NONE);
    onChangeAmountInput(balance.formatted);
  };

  useEffect(() => {
    setDidEnter(false);
  }, []);



  // Valid if no input, otherwise check if there's not an error
  const isAmountValid = (amountInput ?? "") === "" || !validationError;

  // console.log("isAmountValid", isAmountValid, amountInput, validationError);

  return (
    <AmountExternalWrapper>
      <AmountWrapper valid={didEnter ? isAmountValid : true}>
        <AmountInnerWrapper>
          <AmountInnerWrapperTextStack>
            {balance && (displayBalance || amountInput) && (
              <div className="text-sm text-gray-400">
                Balance: {formatUnits(balance.value, token.data.decimals)}{" "}
                {token.data.displaySymbol || token.data.symbol.toUpperCase()}
              </div>
            )}
            <AmountInnerInput
              type="number"
              valid={didEnter ? isAmountValid : true}
              placeholder="Enter amount"
              value={amountInput}
              onChange={(e) => {
                if (!didEnter) {
                  setDidEnter(true);
                }
                onChangeAmountInput(e.target.value);
              }}
              onFocus={() => {
                setDisplayBalance(true);
              }}
              onBlur={() => {
                setDisplayBalance(false);
              }}
              data-cy="bridge-amount-input"
            />
          </AmountInnerWrapperTextStack>
          <MaxButtonWrapper
            onClick={() => {
              if (!didEnter) {
                setDidEnter(true);
              }
              onClickMaxBalance();
            }}
            disabled={!balance}
          >
            MAX
          </MaxButtonWrapper>
        </AmountInnerWrapper>
      </AmountWrapper>
      {didEnter && !isAmountValid && (
        <BridgeInputErrorAlert>
          {validationError === AmountInputError.INSUFFICIENT_BALANCE &&
            "Insufficient balance to process this transfer."}
          {validationError === AmountInputError.INVALID &&
            "Only positive numbers are allowed as an input."}
          {validationError === AmountInputError.AMOUNT_TOO_LOW &&
            "The amount you are trying to bridge is too low."}
        </BridgeInputErrorAlert>
      )}
    </AmountExternalWrapper>
  );
}

export default AmountInput;

interface IValidInput {
  valid: boolean;
}

const BridgeInputErrorAlert = ({ children }) => (
  <ErrorWrapper>
    <div className="text-sm text-red-400">
      {children}
    </div>
  </ErrorWrapper>
);

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  padding: 0px;
  gap: 8px;

  width: 100%;
`;

const AmountWrapper = styled.div<IValidInput>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 9px 20px 9px 32px;
  background: #2d2e33;
  border: 1px solid ${({ valid }) => (valid ? "#4c4e57" : "#f96c6c")};
  border-radius: 32px;

  width: 100%;
  height: 64px;

  flex-shrink: 0;


`;

const AmountExternalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  width: calc(70% - 6px);
  flex-shrink: 0;

`;

const AmountInnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 0px;
  gap: 16px;
  width: 100%;
`;

const MaxButtonWrapper = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 10px;

  height: 24px;
  width: fit-content;

  border: 1px solid #4c4e57;
  border-radius: 24px;

  cursor: pointer;

  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #c5d5e0;

  &:hover {
    color: #e0f3ff;
    border-color: #e0f3ff;
  }

    &:hover:not(:disabled) {
        cursor: pointer;
    }

    &:disabled {
        cursor: not-allowed;
    }


`;

const AmountInnerWrapperTextStack = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  padding: 0px;
`;

const AmountInnerInput = styled.input<IValidInput>`
  font-weight: 400;
  font-size: 18px;
  line-height: 26px;
  color: #e0f3ff;

  color: ${({ valid }) => (valid ? "#e0f3ff" : "#f96c6c")};
  background: none;

  width: 100%;
  padding: 0;
  border: none;
  outline: 0;

  &:focus {
    outline: 0;
    font-size: 18px;
  }

  &::placeholder {
    color: #9daab3;
  }

  overflow-x: hidden;

  // hide number input arrows
  /* Chrome, Safari, Edge, Opera */
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  /* Firefox */
  -moz-appearance: textfield;
  appearance: textfield;
`;