// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {EthereumUtils} from "@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol";
import {Sapphire} from "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/ICryptoFacet.sol";
import "hardhat/console.sol";

contract CryptoFacet is ICryptoFacet {
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

    function getSignerAddress() external view returns (address) {
        return facetStorage().addr;
    }

    function randomBytes(uint256 numBytes, bytes calldata pers) external view returns (bytes memory) {
        return Sapphire.randomBytes(numBytes, pers);
    }

    function sign(bytes32 digest) external view returns (bytes memory) {
        FacetStorage storage s = facetStorage();
        require(s.secretKey != bytes32(0), "CryptoFacet: No signing key");
        return Sapphire.sign(Sapphire.SigningAlg.Secp256k1PrehashedSha256, abi.encodePacked(s.secretKey), abi.encodePacked(digest), "");
    }

    function generateEthereumAccount() internal view returns (bytes32 secretKey, address addr) {

        bytes memory randSeed = Sapphire.randomBytes(32, "CryptoFacet.generateEthereumAccount");
        secretKey = bytes32(randSeed);

        (bytes memory pk, ) = Sapphire.generateSigningKeyPair(Sapphire.SigningAlg.Secp256k1PrehashedKeccak256, randSeed);

        addr = EthereumUtils.k256PubkeyToEthereumAddress(pk);
    }
}
