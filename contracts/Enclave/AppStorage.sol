// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./interfaces/ICryptoFacet.sol";

struct AppStorage {
    //Identity
    mapping(bytes32 => bytes32) did2Aid;
    //mapping(bytes32 => AtlasAccount) aid2Account;
    mapping(address => bool) authProviders;
    mapping(bytes32 => mapping(address => uint)) walletAssetBalance;
    mapping(bytes32 => mapping(address => uint)) walletAssetLock;
    address[] assetList;
    ICryptoFacet cryptoFacet;
}


