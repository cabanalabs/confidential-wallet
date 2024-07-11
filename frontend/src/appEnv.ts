
export class AppEnv {
  static apply(vars: Partial<AppEnv> = {}) {
    Object.assign(appEnv, vars);

    if (appEnv.CHAIN_VAULT_ADDR === undefined || appEnv.ENCLAVE_WALLET_ADDR === undefined || appEnv.DEPLOYER_ADDRESS === undefined) {
      throw new Error('Env variables not set')
    }
  }

  SAPPHIRE_NETWORK: string;
  DEPLOYER_ADDRESS: `0x${string}`;

  ENCLAVE_WALLET_ADDR: `0x${string}`;
  CHAIN_VAULT_ADDR: `0x${string}`;
}

export const appEnv = new AppEnv();

