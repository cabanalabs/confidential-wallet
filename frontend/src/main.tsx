import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.tsx'
import {FetchHttpClient, platformDi} from "./mw/platform";
import {RecoilRoot} from "recoil";
import {BrowserRouter} from "react-router-dom";
import {darkTheme, getDefaultConfig, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {bsc, bscTestnet, hardhat, mainnet, sepolia} from "viem/chains";
import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';
import './tw.css'
import '@mantine/core/styles.css';
import './app.css';
import {AppEnv} from "./appEnv.ts";
import {MantineProvider} from "@mantine/core";

console.log('import.meta.env.VITE_SERVER_URL', import.meta.env.VITE_SERVER_URL);
platformDi.registerHttpClient(new FetchHttpClient(), import.meta.env.VITE_SERVER_URL);

const env = {
  SAPPHIRE_NETWORK: import.meta.env.VITE_SAPPHIRE_NETWORK,
  DEPLOYER_ADDRESS: import.meta.env.VITE_DEPLOYER_ADDRESS,
  ENCLAVE_WALLET_ADDR: import.meta.env.VITE_ENCLAVE_WALLET_ADDR,
  CHAIN_VAULT_ADDR: import.meta.env.VITE_CHAIN_VAULT_ADDR,
};

AppEnv.apply(env);

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [bscTestnet],
});

const fontFamily = "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
          <WagmiProvider config={config}>
            <MantineProvider defaultColorScheme="dark" theme={{ fontFamily}}>
              <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                  <App />
                </RainbowKitProvider>
              </QueryClientProvider>
            </MantineProvider>
          </WagmiProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>,
)
