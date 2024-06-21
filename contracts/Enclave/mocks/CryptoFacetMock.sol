// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "../interfaces/ICryptoFacet.sol";

contract CryptoFacetMock is ICryptoFacet {

    bytes32 constant FACET_STORAGE_POSITION = keccak256("protocol.CryptoFacet.storage");

    struct FacetStorage {
        bytes32 secretKey;
        address addr;
    }

    constructor() {
        rotateSigningKey();
    }

    function facetStorage() internal pure returns (FacetStorage storage ds) {
        bytes32 position = FACET_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function rotateSigningKey() internal {
        FacetStorage storage s = facetStorage();
        (s.secretKey, s.addr) = generateEthereumAccount();
    }

    function randomBytes(uint256, bytes calldata salt) external view returns (bytes memory) {
        return abi.encodePacked(keccak256(abi.encodePacked(block.timestamp, salt)));
    }

    function getSignerAddress() external view returns (address) {
        return facetStorage().addr;
    }

    function generateEthereumAccount() internal pure returns (bytes32 secretKey, address addr) {
        secretKey = bytes32(hex"f4b088aa0b42936aea20dd519a4f7c365124a3a1d1cc9112a2ab7ef614d10a75");
//        publicKey = bytes(hex"021848794cb44de481c236faff3e010c07d20672f488f978d97cd4a562c774e388");
        addr = address(bytes20(hex"3d4Bc8DD6922A43bD636c24B11f7d7f3aaDc436D"));
    }

    function sign(bytes32 digest) external view returns (bytes memory) {
        require(digest != bytes32(0), "CryptoFacet: No digest");
        FacetStorage storage s = facetStorage();
        require(s.secretKey != bytes32(0), "CryptoFacet: No signing key");

        if (digest == bytes32(hex"6a3507135a255685435f9204cf5b2a1111ddf0d82bd69825f8b892c02d909e94")) {
            return hex"25d4a404024e50d52a7138df42e3be9ea46af57149ebafd0ba172d3eb35c82962fc74549b73468c2a4f56cd5ea265f985c6aedd79d604c9bccf53b7f8e714bf51b";
        }

        if (digest == bytes32(hex"42bae486d73edc3305e28592c1cd7b153f5852cf4733dac2c27fbe67b40b348c")) {
            return hex"7e13b0d3cb8688b5444e28583ca3d1bd7cc78a6bfba7f6f4f9a211631576c78065392115cda5b9e45964bde827218276100b629fc51d8ea9a5a0573bad3687871b";
        }

        console.log("CryptoFacetMock: Unknown digest", uint(digest));

        return hex"deadbeef";
    }
}
