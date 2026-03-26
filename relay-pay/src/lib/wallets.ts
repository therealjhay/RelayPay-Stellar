import type { WalletProvider } from '../types';

// Helper to safely access browser wallet extensions on window
function getWindowProp<T>(key: string): T {
  return (window as unknown as Record<string, T>)[key];
}

// Freighter wallet adapter (https://www.freighter.app/)
const freighterProvider: WalletProvider = {
  name: 'Freighter',
  icon: '🚀',
  isInstalled: () => {
    return typeof window !== 'undefined' && 'freighter' in window;
  },
  connect: async () => {
    const freighter = getWindowProp<{
      requestAccess: () => Promise<{ publicKey: string } | string>;
      getPublicKey: () => Promise<string>;
    }>('freighter');
    const result = await freighter.requestAccess();
    if (typeof result === 'string') {
      return result;
    }
    return result.publicKey;
  },
  signTransaction: async (xdr: string, networkPassphrase: string) => {
    const freighter = getWindowProp<{
      signTransaction: (
        xdr: string,
        opts: { networkPassphrase: string }
      ) => Promise<string | { signedTxXdr: string }>;
    }>('freighter');
    const result = await freighter.signTransaction(xdr, { networkPassphrase });
    if (typeof result === 'string') {
      return result;
    }
    return result.signedTxXdr;
  },
};

// Albedo wallet adapter (https://albedo.link/)
const albedoProvider: WalletProvider = {
  name: 'Albedo',
  icon: '✨',
  isInstalled: () => {
    return typeof window !== 'undefined' && 'albedo' in window;
  },
  connect: async () => {
    const albedo = getWindowProp<{
      publicKey: (opts: Record<string, unknown>) => Promise<{ pubkey: string }>;
    }>('albedo');
    const result = await albedo.publicKey({});
    return result.pubkey;
  },
  signTransaction: async (xdr: string, networkPassphrase: string) => {
    const albedo = getWindowProp<{
      tx: (opts: {
        xdr: string;
        network: string;
        submit: boolean;
      }) => Promise<{ signed_envelope_xdr: string }>;
    }>('albedo');
    const network = networkPassphrase.includes('Test SDF') ? 'testnet' : 'public';
    const result = await albedo.tx({ xdr, network, submit: false });
    return result.signed_envelope_xdr;
  },
};

// Lobstr wallet adapter (https://lobstr.co/)
const lobstrProvider: WalletProvider = {
  name: 'Lobstr',
  icon: '🦞',
  isInstalled: () => {
    return typeof window !== 'undefined' && 'lobstr' in window;
  },
  connect: async () => {
    const lobstr = getWindowProp<{
      getPublicKey: () => Promise<string>;
    }>('lobstr');
    return await lobstr.getPublicKey();
  },
  signTransaction: async (xdr: string, networkPassphrase: string) => {
    const lobstr = getWindowProp<{
      signTransaction: (
        xdr: string,
        opts: { networkPassphrase: string }
      ) => Promise<{ signedTxXdr: string }>;
    }>('lobstr');
    const result = await lobstr.signTransaction(xdr, { networkPassphrase });
    return result.signedTxXdr;
  },
};

// Registry of all supported wallet providers
export const WALLET_PROVIDERS: Record<string, WalletProvider> = {
  freighter: freighterProvider,
  albedo: albedoProvider,
  lobstr: lobstrProvider,
};

/**
 * Returns wallet providers that are currently installed in the browser.
 */
export function getInstalledWallets(): WalletProvider[] {
  return Object.values(WALLET_PROVIDERS).filter((w) => w.isInstalled());
}
