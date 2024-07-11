// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./AppStorage.sol";
import {BaseIntent} from "./BaseIntent.sol";

error AutoConfigUnavailable();

interface ICelerMessageBus {
    function feeBase() external view returns (uint256);

    function feePerByte() external view returns (uint256);

    function sendMessage(address _host, uint256 _hostChainId, bytes calldata _message) external payable;
}

interface ICelerEndpoint {
    function executeMessage(address _sender, uint64 _senderChainId, bytes calldata _message, address) external payable returns (uint256);
}

abstract contract SpokeEndpoint {

    uint256 private txSeq;
    address private /*immutable*/ enclaveEndpoint;
    address private immutable messageBus;

    //SAPPHIRE TESTNET
    uint64 constant private REMOTE_CHAIN_ID = 0x5aff;

    constructor(address _enclaveEndpoint, address _messageBus) {
        enclaveEndpoint = _enclaveEndpoint;
        messageBus = _messageBus;
    }

    /* NOTE: for testing only */
    function registerEndpoint(address _enclaveEndpoint) public {
        enclaveEndpoint = _enclaveEndpoint;
    }

    /// Calls the HubEndpoint, returning the amount of native token charged for the operation.
    function _postMessage(bytes memory _method, bytes memory _message) internal returns (uint256) {

        bytes memory envelope = abi.encode(bytes4(keccak256(_method)), txSeq, _message);
        uint256 fee = estimateFee(envelope.length);

//        console.log("ChainVaultEndpoint._postMessage", messageBus, enclaveEndpoint, fee);

        if (_isLocalNetwork()) {
            uint256 celerStatus = ICelerEndpoint(enclaveEndpoint).executeMessage(
                address(this), // sender
                uint64(block.chainid),
                envelope,
                address(this) // executor
            );
            // Receiving endpoint did not return successfully.
            require(celerStatus == 1, "ReceiverError");
            if (fee > 0) payable(0).transfer(fee); // burn the fee, for fidelity
        } else {
            ICelerMessageBus(messageBus).sendMessage{value: fee}(
                enclaveEndpoint,
                REMOTE_CHAIN_ID,
                envelope
            );
        }
        ++txSeq;
        return fee;
    }

    function estimateFee(uint256 _msgLen) internal view returns (uint256) {
        if (_isLocalNetwork()) return 0;
        uint256 feeBase = ICelerMessageBus(messageBus).feeBase();
        uint256 feePerByte = ICelerMessageBus(messageBus).feePerByte();
        return feeBase + _msgLen * feePerByte;
    }

    function _isLocalNetwork() internal view returns (bool) {
        return (block.chainid == 1337 || block.chainid == 31337);
    }
}

function getMessageBus() view returns (address) {
    if (block.chainid == 1337 || block.chainid == 31337) return address(0);
    (address messageBus, ) = _getChainConfig(block.chainid);
    return messageBus;
}

/// Configs from https://im-docs.celer.network/developer/contract-addresses-and-rpc-info.
function _getChainConfig(uint256 _chainId)
    pure
    returns (address _messageBus, bool _isTestnet)
{
    if (_chainId == 1)
        // ethereum
        return (0x4066D196A423b2b3B8B054f4F40efB47a74E200C, false);
    if (_chainId == 5)
        // goerli
        return (0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2, true);
    if (_chainId == 10)
        // optimism
        return (0x0D71D18126E03646eb09FEc929e2ae87b7CAE69d, false);
    if (_chainId == 56)
        // bsc
        return (0x95714818fdd7a5454F73Da9c777B3ee6EbAEEa6B, false);
    if (_chainId == 97)
        // bsc testnet
        return (0xAd204986D6cB67A5Bc76a3CB8974823F43Cb9AAA, true);
    if (_chainId == 137)
        // polygon
        return (0xaFDb9C40C7144022811F034EE07Ce2E110093fe6, false);
    if (_chainId == 0xfa)
        // fantom
        return (0xFF4E183a0Ceb4Fa98E63BbF8077B929c8E5A2bA4, false);
    if (_chainId == 0xfa2)
        // fantom testnet
        return (0xb92d6933A024bcca9A21669a480C236Cbc973110, true);
    if (_chainId == 0x505)
        // moonriver
        return (0x940dAAbA3F713abFabD79CdD991466fe698CBe54, false);
    if (_chainId == 0x5afe)
        // sapphire
        return (0x9Bb46D5100d2Db4608112026951c9C965b233f4D, false);
    if (_chainId == 0x5aff)
        // sapphire testnet
        return (0x9Bb46D5100d2Db4608112026951c9C965b233f4D, true);
    if (_chainId == 0xa4b1)
        // arbitrum one
        return (0x3Ad9d0648CDAA2426331e894e980D0a5Ed16257f, false);
    if (_chainId == 0xa4ba)
        // arbitrum nova
        return (0xf5C6825015280CdfD0b56903F9F8B5A2233476F5, false);
    if (_chainId == 43113)
        // avalanche c-chain fuji testnet
        return (0xE9533976C590200E32d95C53f06AE12d292cFc47, true);
    if (_chainId == 43114)
        // avalanche c-chain
        return (0x5a926eeeAFc4D217ADd17e9641e8cE23Cd01Ad57, false);
    if (_chainId == 80001)
        // polygon mumbai testnet
        return (0x7d43AABC515C356145049227CeE54B608342c0ad, true);
    if (_chainId == 0x66eeb)
        // arbitrum testnet
        return (0x7d43AABC515C356145049227CeE54B608342c0ad, true);
    revert AutoConfigUnavailable();
}
