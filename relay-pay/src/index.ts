// Main component
export { RelayPayButton } from './components/RelayPay';

// Sub-components (for advanced usage)
export { WalletModal } from './components/WalletModal';
export { StatusToast } from './components/StatusToast';

// Hooks
export { useWallet } from './hooks/useWallet';
export { usePayment } from './hooks/usePayment';

// Utilities
export { isValidStellarAddress, getNetworkPassphrase } from './lib/relay';
export { getInstalledWallets, WALLET_PROVIDERS } from './lib/wallets';

// Types
export type {
  RelayPayButtonProps,
  WalletProvider,
  WalletName,
  StellarNetwork,
  StellarAsset,
  TransactionResult,
  PaymentStatus,
  PaymentState,
  WalletState,
  Theme,
} from './types';
