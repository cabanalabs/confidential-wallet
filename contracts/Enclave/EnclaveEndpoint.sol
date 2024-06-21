// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "hardhat/console.sol";

error NotMessageBus();
error NotHostChain();
error MissingEndpoint();
error InvalidNonce();

abstract contract EnclaveEndpoint {
    address internal constant messageBus = 0x9Bb46D5100d2Db4608112026951c9C965b233f4D;
    mapping(uint64 => address) internal hostChains;
    mapping(uint64 => mapping(address => mapping(uint256 => uint256))) private nonceBitmap;

    /// The outcome of the message call.
    enum Result {
        MissingEndpoint,
        // The message was rejected.
        PermanentFailure,
        // The message was rejected but may be accepted later.
        TransientFailure,
        // The message was accepted and processed.
        Success
    }

    function resolveEndpoint(bytes4 epSel, bytes memory args) internal virtual returns (Result);

    function registerHostChain(uint64 chainId, address remote) public {
        hostChains[chainId] = remote;
    }

    function unregisterHostChain(uint64 chainId) internal {
        delete hostChains[chainId];
    }

    /// Celer message bus callback function.
    function executeMessage(address _sender, uint64 _senderChainId, bytes calldata _message, address) external payable returns (uint256) {
        console.log("executeMessage", _sender);
        // The method can only be called by the message bus;
        if(!_isLocalNetwork() && msg.sender != messageBus) revert NotMessageBus();
        // Messages may only be sent by a registered host chain
        if(hostChains[_senderChainId] != _sender) revert NotHostChain();

        (bytes4 epSel, uint256 nonce, bytes memory message) = abi.decode(_message, (bytes4, uint256, bytes));

        _useUnorderedNonce(_senderChainId, _sender, nonce);

        Result result = resolveEndpoint(epSel, message);
        //console.log("Result", result == Result.Success);
        // Convert the Result to a Celer ExecutionStatus.
        if (result == Result.MissingEndpoint) revert MissingEndpoint();
        if (result == Result.TransientFailure) return 2; // ExecutionStatus.Retry
        if (result == Result.Success) return 1; // ExecutionStatus.Success
        return 0; // ExecutionStatus.Fail
    }

    function _isLocalNetwork() internal view returns (bool) {
        return (block.chainid == 1337 || block.chainid == 31337);
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
    function _useUnorderedNonce(uint64 chainId, address from, uint256 nonce) internal {
        (uint256 wordPos, uint256 bitPos) = bitmapPositions(nonce);
        uint256 bit = 1 << bitPos;
        uint256 flipped = nonceBitmap[chainId][from][wordPos] ^= bit;

        if (flipped & bit == 0) revert InvalidNonce();
    }
}
