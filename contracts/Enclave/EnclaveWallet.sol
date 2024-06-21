// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {EnclaveEndpoint} from "./EnclaveEndpoint.sol";
import {ICryptoFacet} from "./interfaces/ICryptoFacet.sol";
import "../shared/libraries/LibIntent.sol";
import "../shared/libraries/LibEIP712.sol";
import "./AppStorage.sol";

import "hardhat/console.sol";

struct AssetBalance {
    address asset;
    uint balance;
}

contract EnclaveWallet is EnclaveEndpoint {
    AppStorage internal s;

    error NotAllowed(address sender);

    event Deposit(address from, address asset, uint amount);
    event Withdrawal(address from, address asset, uint amount);
    event WithdrawalIntent(address to, address asset, uint amount, uint chainId);

    bytes4 constant private DEPOSIT = bytes4(keccak256("deposit"));
    bytes4 constant private WITHDRAW = bytes4(keccak256("withdraw"));

    constructor(address cryptoService) {
        s.assetList.push(address(0));
        s.cryptoFacet = ICryptoFacet(cryptoService);
    }

    function getAccount(uint64 chainId, address account) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(chainId, account));
    }

    function resolveEndpoint(bytes4 epSel, bytes memory args) internal override returns (EnclaveEndpoint.Result) {
        if (epSel == DEPOSIT) return _oplDeposit(args);
        if (epSel == WITHDRAW) return _oplWithdraw(args);
        return EnclaveEndpoint.Result.MissingEndpoint;
    }

    function _oplDeposit(bytes memory args) internal returns (EnclaveEndpoint.Result)  {

        (uint64 chainId, address user, address asset, uint amount) = abi.decode(args, (uint64,address,address,uint));

        bytes32 identity = getAccount(chainId,user);

        console.log("_oplDeposit", user, amount, s.walletAssetBalance[identity][asset]);

        s.walletAssetBalance[identity][asset] += amount;

        emit Deposit(user, asset, amount);

        return EnclaveEndpoint.Result.Success;
    }

    //Need to optimize byte length.
    //chainId (remove zeros), user address -> tx.nonce (remove zeros), asset -> remove (lookup from tx.nonce), amount -> 0 if same as expected otherwise uint256 (remove zeros)
    function _oplWithdraw(bytes memory args) internal returns (EnclaveEndpoint.Result) {
        (uint64 chainId, address user, address asset, uint amount) = abi.decode(args, (uint64,address,address,uint));
        console.log("_oplWithdraw", user, asset, amount);
        s.walletAssetBalance[getAccount(chainId,user)][asset] -= amount;
        emit Withdrawal(user, asset, amount);
        return EnclaveEndpoint.Result.Success;
    }

    function getBalance(uint64 chainId, address user) public view returns (uint) {
        return s.walletAssetBalance[getAccount(chainId,user)][address(0)];
    }

    function getAllBalances(bytes32 userId) public view returns (AssetBalance[] memory) {
        bytes32 identity = s.did2Aid[userId];
        uint len = s.assetList.length;
        AssetBalance[] memory balances = new AssetBalance[](len+1);
        balances[0] = AssetBalance(address(0), s.walletAssetBalance[identity][address(0)]);
        for (uint i = 1; i < len; i++) {
            address asset = s.assetList[i];
            balances[i] = AssetBalance(asset, s.walletAssetBalance[identity][asset]);
        }
        return balances;
    }

    function getTokenBalance(uint64 chainId, address user, address asset) public view returns (uint) {
        return s.walletAssetBalance[getAccount(chainId,user)][asset];
    }

    function signWithdrawIntent(WithdrawIntent calldata intent, uint64 chainId, address verifyingContract) public view returns (bytes memory){
        require(intent.recipient == msg.sender, "NotAllowed");

        bytes32 identity = getAccount(chainId,msg.sender);
        require(s.walletAssetBalance[identity][address(0)] >= intent.amount, "InsufficientBalance");

        bytes32 digest = LibEIP712.hashTypedData(LibIntent.hash(intent), LibEIP712.buildDomainSeparator(chainId, verifyingContract));

//        console.log("withdraw.digest", uint256(digest));

        return s.cryptoFacet.sign(digest);
    }

    function getIntentHash(WithdrawIntent memory intent, uint64 chainId, address verifyingContract) public pure returns (bytes32) {
        return LibEIP712.hashTypedData(LibIntent.hash(intent), LibEIP712.buildDomainSeparator(chainId, verifyingContract));
    }

    function signWithdrawTokenIntent(WithdrawTokenIntent memory intent, uint64 chainId, address verifyingContract) public view returns (bytes memory){
        if(intent.recipient != msg.sender) revert NotAllowed(msg.sender);

        bytes32 identity = getAccount(chainId,msg.sender);
        require(s.walletAssetBalance[identity][intent.token] >= intent.amount, "InsufficientBalance");

        bytes32 digest = LibEIP712.hashTypedData(LibIntent.hash(intent), LibEIP712.buildDomainSeparator(chainId, verifyingContract));

//        console.log("withdrawToken.digest", uint256(digest));

        return s.cryptoFacet.sign(digest);
    }

    function getSignerAddress() public view returns (address) {
        return s.cryptoFacet.getSignerAddress();
    }

}
