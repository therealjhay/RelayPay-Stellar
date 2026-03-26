import { useState, useCallback, useEffect } from 'react';
import { getInstalledWallets } from '../lib/wallets';
import type { WalletProvider } from '../types';

export interface UseWalletReturn {
  installedWallets: WalletProvider[];
  selectedWallet: WalletProvider | null;
  publicKey: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  connect: (wallet: WalletProvider) => Promise<string | null>;
  disconnect: () => void;
}

/**
 * Hook for detecting installed Stellar wallets and managing wallet connections.
 */
export function useWallet(): UseWalletReturn {
  const [installedWallets, setInstalledWallets] = useState<WalletProvider[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Detect installed wallets on mount
  useEffect(() => {
    setInstalledWallets(getInstalledWallets());
  }, []);

  const connect = useCallback(async (wallet: WalletProvider): Promise<string | null> => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const key = await wallet.connect();
      setPublicKey(key);
      setSelectedWallet(wallet);
      return key;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setConnectionError(message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setSelectedWallet(null);
    setConnectionError(null);
  }, []);

  return {
    installedWallets,
    selectedWallet,
    publicKey,
    isConnected: publicKey !== null,
    isConnecting,
    connectionError,
    connect,
    disconnect,
  };
}
