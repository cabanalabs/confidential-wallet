export type Size = 'small' | 'medium' | 'large';
export type LoaderSize = 'small' | 'medium' | 'large' | 'x-large';
export type Corners = 'square' | 'square-rounded' | 'rounded' | 'none';
export type Alignment = 'start' | 'end';
export type FontSize = 'small' | 'medium';
export type ListItemType =
  | 'label'
  | 'button'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'icon'
  | 'manage_wallet';

export type Accent =
  | 'accent-1'
  | 'accent-2'
  | 'accent-3'
  | 'transparent-25'
  | 'white'
  | 'black';

export type LoadingPosition = 'start' | 'center' | 'end';
export interface SvgProps {
  fill?: string;
  size?: Size;
}

export type Token = {
  label: string;
  value: string;
  iconUrl?: string;
  data: {
    symbol: string;
    decimals: number;
    displaySymbol: string;
    address?: `0x${string}`;
  }
}

export type TokenBalance = {
  decimals: number; formatted: string; symbol: string; value: bigint;
};

// export { iconNamesArr } from './iconNames';
// export { assetNamesArr } from './assetNames';

const resolveIcon = (token: string) => {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token}/logo.png`
}

// export const token = { symbol: "ETH", decimals: 18, displaySymbol: "ETH" };

//BSC TOKEN MAP
export const tokenMap: Record<string,Token> = {
  bnb: {
    label: 'BNB',
    value: 'bnb',
    iconUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png',
    data: {symbol: "BNB", decimals: 18, displaySymbol: "BNB"}
  },
  eth: {
    label: 'ETH',
    value: 'eth',
    iconUrl: resolveIcon('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
    data: {symbol: "ETH", decimals: 18, displaySymbol: "ETH", address: '0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378'}
  },
  usdt: {
    label: 'USDT',
    value: 'usdt',
    iconUrl: resolveIcon('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
    data: {symbol: "USDT", decimals: 18, displaySymbol: "USDT", address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'}
  }
  // usdc: {
  //   label: 'USDC',
  //   value: 'usdc',
  //   iconUrl: resolveIcon('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  //   data: {symbol: "USDC", decimals: 18, displaySymbol: "USDC", address: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0'}
  // }
}
