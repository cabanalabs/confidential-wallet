
import {hashTypedData, type Hex, type TypedDataDomain} from "viem";

import {maxUint256} from "viem";

export type TypedDataField = { name: string, type: string };

export const MaxSignatureTransferAmount = maxUint256
export const MaxUnorderedNonce = maxUint256
export const MaxSigDeadline = maxUint256

export interface WithdrawIntent {
  signer: string
  amount: bigint
  recipient: string;
  nonce: bigint
  deadline: bigint
}

export interface WithdrawTokenIntent {
  signer: string
  token: string
  amount: bigint
  recipient: string;
  nonce: bigint
  deadline: bigint
}

export type WithdrawIntentData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: WithdrawIntent
}

export type WithdrawTokenIntentData = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  values: WithdrawTokenIntent
}

const WITHDRAW_TYPES = {
  Withdraw: [
    { name: 'signer', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'recipient', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

const WITHDRAW_TOKEN_TYPES = {
  WithdrawToken: [
    { name: 'signer', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'token', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ]
}

const INTENT_DOMAIN_NAME = 'Protocol'

function buildIntentDomain(verifyingContract: Hex, chainId: number): TypedDataDomain {
  return {
    name: INTENT_DOMAIN_NAME,
    chainId,
    verifyingContract,
  }
}

class IntentWithdrawBuilder {

  private verifyAttributes(intent: WithdrawIntent | WithdrawTokenIntent): void {
    if(intent.deadline > MaxSigDeadline) throw new Error('SIG_DEADLINE_OUT_OF_RANGE')
    if(intent.nonce > MaxUnorderedNonce) throw new Error('NONCE_OUT_OF_RANGE')
    if(intent.amount > MaxSignatureTransferAmount) throw new Error('AMOUNT_OUT_OF_RANGE')
  }

  public getWithdrawIntentData(intent: WithdrawIntent, verifyingContract: Hex, chainId: number): WithdrawIntentData {
    this.verifyAttributes(intent)

    const domain = buildIntentDomain(verifyingContract, chainId)

    return { domain, types: WITHDRAW_TYPES, values: intent }
  }

  public getWithdrawTokenIntentData(intent: WithdrawTokenIntent, verifyingContract: Hex, chainId: number): WithdrawTokenIntentData {
    this.verifyAttributes(intent)

    const domain = buildIntentDomain(verifyingContract, chainId)

    return { domain, types: WITHDRAW_TOKEN_TYPES, values: intent }
  }

  public hashWithdrawIntent(intent: WithdrawIntent, verifyingContract: Hex, chainId: number): string {
    const { domain, types, values } = this.getWithdrawIntentData(intent, verifyingContract, chainId)
    return hashTypedData({domain, types, primaryType: 'Withdraw', message: { ...values } })
  }

  public hashWithdrawTokenIntent(intent: WithdrawTokenIntent, verifyingContract: Hex, chainId: number): string {
    const { domain, types, values } = this.getWithdrawTokenIntentData(intent, verifyingContract, chainId)
    return hashTypedData({domain, types, primaryType: 'WithdrawToken', message: { ...values } })
  }
}

export const intentWithdrawBuilder = new IntentWithdrawBuilder();
