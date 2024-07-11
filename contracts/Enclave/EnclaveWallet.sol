// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {HubEndpoint} from "./HubEndpoint.sol";
import {ICryptoFacet} from "./interfaces/ICryptoFacet.sol";
import "../shared/libraries/LibIntent.sol";
import "../shared/libraries/LibEIP712.sol";
import "./AppStorage.sol";

import "hardhat/console.sol";

struct AssetBalance {
    address asset;
    uint balance;
}

contract EnclaveWallet is HubEndpoint {
    AppStorage internal s;

    error NotAllowed(address sender);
    error UnsupportedAsset();

    event Deposit(address from, address asset, uint amount);
    event Withdrawal(address from, address asset, uint amount);
//    event WithdrawalIntent(address to, address asset, uint amount, uint64 chainId);

    bytes4 constant private DEPOSIT = bytes4(keccak256("deposit"));
    bytes4 constant private WITHDRAW = bytes4(keccak256("withdraw"));

    constructor(address cryptoService) {
        s.assetList.push(address(0));
        s.cryptoFacet = ICryptoFacet(cryptoService);
    }

    function getAccount(uint64 chainId, address account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function getLikeKindAsset(uint64 chainId, address asset) internal pure returns (address) {
//        if (chainId == 97) {
//            //BSC:ETH -> ETH:ETH
//            if (asset == 0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378) {
//                return address(0);
//            }
//            //BSC:USDT -> ETH:USDT
//            else if (asset == 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd) {
//                return address(0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0);
//            }
////            revert UnsupportedAsset();
//            require(false, "UnsupportedAsset");
//        }
        return asset;
    }

    function resolveEndpoint(bytes4 epSel, bytes memory args) internal override returns (HubEndpoint.Result) {
        if (epSel == DEPOSIT) return _oplDeposit(args);
        if (epSel == WITHDRAW) return _oplWithdraw(args);
        return HubEndpoint.Result.MissingEndpoint;
    }

    function _oplDeposit(bytes memory args) internal returns (HubEndpoint.Result)  {

        (uint64 chainId, address user, address asset, uint amount) = abi.decode(args, (uint64,address,address,uint));

        bytes32 identity = getAccount(chainId, user);
        address likeKindAsset = getLikeKindAsset(chainId, asset);

        //console.log("_oplDeposit", user, amount, s.walletAssetBalance[identity][likeKindAsset]);

        s.walletAssetBalance[identity][likeKindAsset] += amount;

        emit Deposit(user, asset, amount);

        return HubEndpoint.Result.Success;
    }

    //Need to optimize byte length.
    //chainId (remove zeros), user address -> tx.nonce (remove zeros), asset -> remove (lookup from tx.nonce), amount -> 0 if same as expected otherwise uint256 (remove zeros)
    function _oplWithdraw(bytes memory args) internal returns (HubEndpoint.Result) {
        (uint64 chainId, address user, address asset, uint amount) = abi.decode(args, (uint64,address,address,uint));
        //console.log("_oplWithdraw", user, asset, amount);
        address likeKindAsset = getLikeKindAsset(chainId, asset);
        s.walletAssetBalance[getAccount(chainId,user)][likeKindAsset] -= amount;
        emit Withdrawal(user, asset, amount);
        return HubEndpoint.Result.Success;
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
        address likeKindAsset = getLikeKindAsset(chainId, asset);
        return s.walletAssetBalance[getAccount(chainId,user)][likeKindAsset];
    }

    function signWithdrawIntent(WithdrawIntent memory intent, uint64 chainId, address verifyingContract) public view returns (bytes memory){
        //TODO - implement a SessionKey for authenticated view calls.
        //require(intent.recipient == msg.sender, "NotAllowed");

        bytes32 identity = getAccount(chainId,intent.recipient);
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
        address likeKindAsset = getLikeKindAsset(chainId, intent.token);
        //console.log("withdrawToken.likeKindAsset", likeKindAsset, chainId, intent.token);
        require(s.walletAssetBalance[identity][likeKindAsset] >= intent.amount, "InsufficientBalance");

        bytes32 digest = LibEIP712.hashTypedData(LibIntent.hash(intent), LibEIP712.buildDomainSeparator(chainId, verifyingContract));



        return s.cryptoFacet.sign(digest);
    }

    function getSignerAddress() public view returns (address) {
        return s.cryptoFacet.getSignerAddress();
    }

}
