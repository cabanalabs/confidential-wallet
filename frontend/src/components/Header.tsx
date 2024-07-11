import { ConnectButton } from '@rainbow-me/rainbowkit';
import {useAccount} from "wagmi";
import {useMemo} from "react";
import {useRecoilState} from "recoil";
import {sessionAtom, SessionModel} from "../atoms/session-atom.ts";

export const Header = () => {
  // console.log('header');
  // const {chain, address} = useAccount();
  //
  // const [sessionObj, setSessionObj] = useRecoilState<SessionModel>(sessionAtom);
  //
  // useMemo(() => {
  //   if (sessionObj.chainId !== chain.id || sessionObj.address !== address) {
  //     console.log("chain", chain.name);
  //     setSessionObj({...sessionObj, chainId: chain.id, address: address, chainName: chain.name});
  //   }
  // }, [chain, address])

  return (
    <>
      <div className="flex flex-row-reverse p-4">
        <ConnectButton accountStatus="avatar" />
      </div>
      {/*<div>*/}
      {/*  Chain: {chain?.name}*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*  Address: {address}*/}
      {/*</div>*/}
    </>
  );
}
