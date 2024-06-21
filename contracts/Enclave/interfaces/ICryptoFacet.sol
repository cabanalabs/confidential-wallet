// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

interface ICryptoFacet {
    function randomBytes(uint256 numBytes, bytes calldata pers) external view returns (bytes memory);

    //function rotateSigningKey() external;

    function getSignerAddress() external view returns (address);

    function sign(bytes32 digest) external view returns (bytes memory);
}
