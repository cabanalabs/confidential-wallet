// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import {IEIP712} from "../interfaces/IEIP712.sol";

library LibEIP712 {

    bytes32 constant _HASHED_NAME = keccak256("Protocol");
    bytes32 constant _TYPE_HASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

    /// @notice Creates an EIP-712 typed data hash. The ‘version byte’ is fixed to x01. See https://eips.ethereum.org/EIPS/eip-191
    function hashTypedData(bytes32 dataHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", IEIP712(address(this)).DOMAIN_SEPARATOR(), dataHash));
    }

    function hashTypedData(bytes32 dataHash, bytes32 domainSeparator) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", domainSeparator, dataHash));
    }

    /// @notice Builds a domain separator using the current chainId and contract address.
    function buildDomainSeparator() internal view returns (bytes32) {
        //console.log("EIP712Facet._buildDomainSeparator", block.chainid, address(this));
        return keccak256(abi.encode(_TYPE_HASH, _HASHED_NAME, block.chainid, address(this)));
    }

    function buildDomainSeparator(uint64 chainId, address verifyingContract) internal pure returns (bytes32) {
        //console.log("EIP712Facet._buildDomainSeparator", chainId, verifyingContract);
        return keccak256(abi.encode(_TYPE_HASH, _HASHED_NAME, chainId, verifyingContract));
    }
}
