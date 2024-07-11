

class MessageBusGateway {
  chainListByName = ["ethereum", "goerli", "optimism", "bsc", "bsc-testnet", "polygon", "fantom", "fantom-testnet", "moonriver", "arbitrum-one", "arbitrum-nova", "sapphire", "sapphire-testnet", "polygon-mumbai", "avalanche", "arbitrum-testnet"];
  chainName2ChainId(name: string)  {
    if (name == "ethereum") return 1;
    if (name == "goerli") return 5;
    if (name == "optimism") return 10;
    if (name == "bsc") return 56;
    if (name == "bsc-testnet") return 97;
    if (name == "polygon") return 137;
    if (name == "fantom") return 0xfa;
    if (name == "fantom-testnet") return 0xfa2;
    if (name == "moonriver") return 0x505;
    if (name == "arbitrum-one") return 0xa4b1;
    if (name == "arbitrum-nova") return 0xa4ba;
    if (name == "sapphire") return 0x5afe;
    if (name == "sapphire-testnet") return 0x5aff;
    if (name == "polygon-mumbai") return 80001;
    if (name == "avalanche") return 43114;
   // if (name == "avalanche-fuji") return 43313;
    if (name == "arbitrum-testnet") return 0x66eeb;
    return 0;
  }

/// Configs from https://im-docs.celer.network/developer/contract-addresses-and-rpc-info
  getChainConfig(_chainId: number) {
    if (_chainId == 1)
      // ethereum
      return "0x4066D196A423b2b3B8B054f4F40efB47a74E200C";
    if (_chainId == 5)
      // goerli
      return "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2";
    if (_chainId == 10)
      // optimism
      return "0x0D71D18126E03646eb09FEc929e2ae87b7CAE69d";
    if (_chainId == 56)
      // bsc
      return "0x95714818fdd7a5454F73Da9c777B3ee6EbAEEa6B";
    if (_chainId == 97)
      // bsc testnet
      return "0xAd204986D6cB67A5Bc76a3CB8974823F43Cb9AAA";
    if (_chainId == 137)
      // polygon
      return "0xaFDb9C40C7144022811F034EE07Ce2E110093fe6";
    if (_chainId == 0xfa)
      // fantom
      return "0xFF4E183a0Ceb4Fa98E63BbF8077B929c8E5A2bA4";
    if (_chainId == 0xfa2)
      // fantom testnet
      return "0xb92d6933A024bcca9A21669a480C236Cbc973110";
    if (_chainId == 0x505)
      // moonriver
      return "0x940dAAbA3F713abFabD79CdD991466fe698CBe54";
    if (_chainId == 0x5afe)
      // sapphire
      return "0x9Bb46D5100d2Db4608112026951c9C965b233f4D";
    if (_chainId == 0x5aff)
      // sapphire testnet
      return "0x9Bb46D5100d2Db4608112026951c9C965b233f4D";
    if (_chainId == 0xa4b1)
      // arbitrum one
      return "0x3Ad9d0648CDAA2426331e894e980D0a5Ed16257f";
    if (_chainId == 0xa4ba)
      // arbitrum nova
      return "0xf5C6825015280CdfD0b56903F9F8B5A2233476F5";
    if (_chainId == 43113)
      // avalanche c-chain fuji testnet
      return "0xE9533976C590200E32d95C53f06AE12d292cFc47";
    if (_chainId == 43114)
      // avalanche c-chain
      return "0x5a926eeeAFc4D217ADd17e9641e8cE23Cd01Ad57";
    if (_chainId == 80001)
      // polygon mumbai testnet
      return "0x7d43AABC515C356145049227CeE54B608342c0ad";
    if (_chainId == 0x66eeb)
      // arbitrum testnet
      return "0x7d43AABC515C356145049227CeE54B608342c0ad";

    console.log(_chainId);
    throw new Error('AutoConfigUnavailable');
  }

}

export const messageBusGateway = new MessageBusGateway();