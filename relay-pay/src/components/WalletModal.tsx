import React from 'react';
import type { WalletProvider } from '../types';

interface WalletModalProps {
  wallets: WalletProvider[];
  isOpen: boolean;
  isConnecting: boolean;
  error: string | null;
  onSelect: (wallet: WalletProvider) => void;
  onClose: () => void;
}

/**
 * Modal for selecting a Stellar wallet when multiple are installed.
 */
export function WalletModal({
  wallets,
  isOpen,
  isConnecting,
  error,
  onSelect,
  onClose,
}: WalletModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div
      className="relay-pay-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select wallet"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relay-pay-modal bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
            disabled={isConnecting}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {wallets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No Stellar wallets detected. Please install{' '}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Freighter
              </a>{' '}
              or another Stellar wallet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {wallets.map((wallet) => (
              <li key={wallet.name}>
                <button
                  onClick={() => onSelect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {wallet.icon}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {wallet.name}
                  </span>
                  {isConnecting && (
                    <span className="ml-auto text-xs text-gray-400">
                      Connecting…
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          By connecting, you agree to sign the payment transaction with your wallet.
        </p>
      </div>
    </div>
  );
}
