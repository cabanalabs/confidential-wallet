// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

struct AppStorage {
    mapping(address => bool) authSigners;
    mapping(address => mapping(uint256 => uint256)) nonceBitmap;
}

