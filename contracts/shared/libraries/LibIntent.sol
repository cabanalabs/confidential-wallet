// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

struct WithdrawIntent {
    address signer;
    uint256 amount;
    address recipient;
    uint256 nonce;
    uint256 deadline;
}

struct WithdrawTokenIntent {
    address signer;
    uint256 amount;
    address token;
    address recipient;
    uint256 nonce;
    uint256 deadline;
}

error SignatureExpired(uint256 signatureDeadline);
error NotAllowedSigner(address signer);
error InvalidNonce();

library LibIntent {

    bytes32 public constant INTENT_WITHDRAW_TYPE_HASH = keccak256("Withdraw(address signer,uint256 amount,address recipient,uint256 nonce,uint256 deadline)");
    bytes32 public constant INTENT_WITHDRAW_TOKEN_TYPE_HASH = keccak256("WithdrawToken(address signer,uint256 amount,address token,address recipient,uint256 nonce,uint256 deadline)");

    function hash(WithdrawIntent memory permit) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(INTENT_WITHDRAW_TYPE_HASH, permit.signer, permit.amount, permit.recipient, permit.nonce, permit.deadline)
        );
    }

    function hash(WithdrawTokenIntent memory permit) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(INTENT_WITHDRAW_TOKEN_TYPE_HASH, permit.signer, permit.amount, permit.token, permit.recipient, permit.nonce, permit.deadline)
        );
    }
}
