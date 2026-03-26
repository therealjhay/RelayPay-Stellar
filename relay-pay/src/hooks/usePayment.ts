import { useState, useCallback } from 'react';
import { buildPaymentTransaction, submitTransaction, isValidStellarAddress } from '../lib/relay';
import { getNetworkPassphrase } from '../lib/relay';
import type { WalletProvider, StellarNetwork, PaymentStatus, TransactionResult } from '../types';

export interface UsePaymentOptions {
  destination: string;
  amount: string;
  asset?: string;
  assetIssuer?: string;
  memo?: string;
  network?: StellarNetwork;
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}

export interface UsePaymentReturn {
  status: PaymentStatus;
  error: string | null;
  result: TransactionResult | null;
  pay: (wallet: WalletProvider, publicKey: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for building and submitting Stellar payment transactions.
 *
 * Defaults to testnet. Pass network="mainnet" for real transactions.
 * WARNING: Never store private keys or secrets in this component.
 */
export function usePayment({
  destination,
  amount,
  asset = 'XLM',
  assetIssuer,
  memo,
  network = 'testnet',
  onSuccess,
  onError,
}: UsePaymentOptions): UsePaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const pay = useCallback(
    async (wallet: WalletProvider, publicKey: string) => {
      // Validate destination before starting
      if (!isValidStellarAddress(destination)) {
        const err = new Error('Invalid destination Stellar address');
        setError(err.message);
        setStatus('error');
        onError?.(err);
        return;
      }

      try {
        // Step 1: Build transaction
        setStatus('signing');
        const xdr = await buildPaymentTransaction(
          publicKey,
          destination,
          amount,
          asset,
          assetIssuer,
          memo,
          network
        );

        // Step 2: Request wallet signature
        const networkPassphrase = getNetworkPassphrase(network);
        const signedXdr = await wallet.signTransaction(xdr, networkPassphrase);

        // Step 3: Submit to Horizon
        setStatus('submitting');
        const txResult = await submitTransaction(
          signedXdr,
          publicKey,
          destination,
          amount,
          asset,
          memo,
          network
        );

        setResult(txResult);
        setStatus('success');
        onSuccess?.(txResult);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Payment failed');
        setError(error.message);
        setStatus('error');
        onError?.(error);
      }
    },
    [destination, amount, asset, assetIssuer, memo, network, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return { status, error, result, pay, reset };
}
