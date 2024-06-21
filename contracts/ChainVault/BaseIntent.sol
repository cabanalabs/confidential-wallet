// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./AppStorage.sol";
import "../shared/libraries/LibIntent.sol";
import "./SignatureVerification.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {LibEIP712} from "../shared/libraries/LibEIP712.sol";


abstract contract BaseIntent {
    AppStorage internal s;

    using SafeERC20 for IERC20;

    /// @notice Emits an event when the owner successfully invalidates an unordered nonce.
    event UnorderedNonceInvalidation(address indexed owner, uint256 word, uint256 mask);

    function intentWithdraw(WithdrawIntent memory intent, bytes memory signature) internal {

        console.log("intent.signer", intent.signer);
        _intentVerify(intent.signer, intent.nonce, intent.deadline, LibIntent.hash(intent), signature);

        console.log("intentWithdraw", intent.amount, address(this).balance);

        require(intent.amount < address(this).balance, "Not enough funds");

        (bool success, ) = intent.recipient.call{value: intent.amount}("");
        require(success, "Transfer failed.");
    }

    function intentWithdrawToken(WithdrawTokenIntent memory intent, bytes memory signature) internal {

        _intentVerify(intent.signer, intent.nonce, intent.deadline, LibIntent.hash(intent), signature);

        IERC20(intent.token).transfer(intent.recipient, intent.amount);
    }

    function _intentVerify(address signer, uint256 nonce, uint256 deadline, bytes32 dataHash, bytes memory signature) private {

        if (!s.authSigners[signer]) revert NotAllowedSigner(signer);
        if (block.timestamp > deadline) revert SignatureExpired(deadline);

        _useUnorderedNonce(address(this), nonce);

        SignatureVerification.verify(signature, LibEIP712.hashTypedData(dataHash), signer);
    }

    function invalidateUnorderedNonces(uint256 wordPos, uint256 mask) internal {
        s.nonceBitmap[msg.sender][wordPos] |= mask;

        emit UnorderedNonceInvalidation(msg.sender, wordPos, mask);
    }

    /// @notice Returns the index of the bitmap and the bit position within the bitmap. Used for unordered nonces
    /// @param nonce The nonce to get the associated word and bit positions
    /// @return wordPos The word position or index into the nonceBitmap
    /// @return bitPos The bit position
    /// @dev The first 248 bits of the nonce value is the index of the desired bitmap
    /// @dev The last 8 bits of the nonce value is the position of the bit in the bitmap
    function bitmapPositions(uint256 nonce) internal pure returns (uint256 wordPos, uint256 bitPos) {
        wordPos = uint248(nonce >> 8);
        bitPos = uint8(nonce);
    }

    /// @notice Checks whether a nonce is taken and sets the bit at the bit position in the bitmap at the word position
    /// @param from The address to use the nonce at
    /// @param nonce The nonce to spend
    function _useUnorderedNonce(address from, uint256 nonce) internal {
        (uint256 wordPos, uint256 bitPos) = bitmapPositions(nonce);
        uint256 bit = 1 << bitPos;
        uint256 flipped = s.nonceBitmap[from][wordPos] ^= bit;

        if (flipped & bit == 0) revert InvalidNonce();
    }
}
