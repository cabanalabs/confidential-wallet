import {atom} from "recoil";

export type SessionModel = {
  chainId: number;
  chainName: string;
  address: string;
}

export const sessionAtom = atom<SessionModel>({
  key: 'sessionAtom',
  default: {
    chainId: 0,
    chainName: '',
    address: '',
  }
});