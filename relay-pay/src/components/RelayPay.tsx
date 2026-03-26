import React, { useState, useCallback } from 'react';
import { WalletModal } from './WalletModal';
import { StatusToast } from './StatusToast';
import { useWallet } from '../hooks/useWallet';
import { usePayment } from '../hooks/usePayment';
import '../styles/button.css';
import type { RelayPayButtonProps, WalletProvider } from '../types';

/**
 * RelayPayButton – a drop-in React component for accepting Stellar payments.
 *
 * Defaults to testnet. Set network="mainnet" for real transactions.
 * WARNING: Never use mainnet without testing on testnet first.
 *
 * @example
 * ```tsx
 * <RelayPayButton
 *   destination="GABC...XYZ"
 *   amount="10"
 *   asset="XLM"
 *   memo="order-123"
 *   onSuccess={(tx) => console.log(tx)}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export function RelayPayButton({
  destination,
  amount,
  asset = 'XLM',
  memo,
  network = 'testnet',
  theme = 'light',
  label,
  className,
  onSuccess,
  onError,
}: RelayPayButtonProps): React.ReactElement {
  const [showModal, setShowModal] = useState(false);

  const {
    installedWallets,
    publicKey,
    isConnecting,
    connectionError,
    connect,
  } = useWallet();

  const { status, error, result, pay, reset } = usePayment({
    destination,
    amount,
    asset,
    memo,
    network,
    onSuccess,
    onError,
  });

  const isLoading =
    isConnecting || status === 'signing' || status === 'submitting';

  const buttonLabel =
    label ??
    (isConnecting
      ? 'Connecting…'
      : status === 'signing'
      ? 'Awaiting signature…'
      : status === 'submitting'
      ? 'Submitting…'
      : `Pay ${amount} ${asset}`);

  const handleButtonClick = useCallback(() => {
    reset();
    setShowModal(true);
  }, [reset]);

  const handleWalletSelect = useCallback(
    async (wallet: WalletProvider) => {
      let key = publicKey;
      if (!key) {
        key = await connect(wallet);
      }
      if (key) {
        setShowModal(false);
        await pay(wallet, key);
      }
    },
    [publicKey, connect, pay]
  );

  const handleModalClose = useCallback(() => {
    if (!isConnecting) setShowModal(false);
  }, [isConnecting]);

  const handleToastDismiss = useCallback(() => {
    reset();
  }, [reset]);

  const toastMessage =
    status === 'success' && result
      ? `Transaction: ${result.hash.slice(0, 8)}…`
      : error ?? undefined;

  return (
    <div
      className="relay-pay-root inline-block"
      data-relay-pay-theme={theme}
    >
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`relay-pay-btn${className ? ` ${className}` : ''}`}
        aria-busy={isLoading}
      >
        {isLoading && (
          <span className="relay-pay-spinner" aria-hidden="true" />
        )}
        {buttonLabel}
      </button>

      <WalletModal
        wallets={installedWallets}
        isOpen={showModal}
        isConnecting={isConnecting}
        error={connectionError}
        onSelect={handleWalletSelect}
        onClose={handleModalClose}
      />

      <StatusToast
        status={status}
        message={toastMessage}
        onDismiss={handleToastDismiss}
      />
    </div>
  );
}
