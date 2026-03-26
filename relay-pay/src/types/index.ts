// Stellar wallet provider interface
export interface WalletProvider {
  name: string;
  icon: string;
  isInstalled: () => boolean;
  connect: () => Promise<string>; // returns public key
  signTransaction: (xdr: string, networkPassphrase: string) => Promise<string>;
}

// Supported wallet names
export type WalletName = 'freighter' | 'albedo' | 'lobstr';

// Supported Stellar networks
export type StellarNetwork = 'testnet' | 'mainnet';

// Theme options
export type Theme = 'light' | 'dark' | 'custom';

// Supported Stellar assets
export interface StellarAsset {
  code: string;
  issuer?: string; // undefined for native XLM
}

// Transaction result returned to onSuccess callback
export interface TransactionResult {
  id: string;
  hash: string;
  ledger: number;
  createdAt: string;
  sourceAccount: string;
  destination: string;
  amount: string;
  asset: string;
  memo?: string;
  networkPassphrase: string;
}

// Props for the RelayPayButton component
export interface RelayPayButtonProps {
  /** Stellar destination address (required) */
  destination: string;
  /** Payment amount in the specified asset (required) */
  amount: string;
  /** Asset code, defaults to 'XLM' */
  asset?: string;
  /** Optional memo text attached to the transaction */
  memo?: string;
  /** Stellar network to use, defaults to 'testnet' */
  network?: StellarNetwork;
  /** UI theme, defaults to 'light' */
  theme?: Theme;
  /** Button label text */
  label?: string;
  /** Additional CSS class name */
  className?: string;
  /** Called with the transaction result on success */
  onSuccess?: (result: TransactionResult) => void;
  /** Called with an Error on failure */
  onError?: (error: Error) => void;
}

// Wallet connection state
export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  walletName: WalletName | null;
  error: string | null;
}

// Payment state
export type PaymentStatus = 'idle' | 'connecting' | 'signing' | 'submitting' | 'success' | 'error';

export interface PaymentState {
  status: PaymentStatus;
  error: string | null;
  result: TransactionResult | null;
}
