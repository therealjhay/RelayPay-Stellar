export type StellarNetwork = 'testnet' | 'mainnet';

export interface PaymentIntent {
  id: string;
  destination: string;
  amount: string;
  asset: string;
  memo?: string;
  network: StellarNetwork;
  status: 'pending' | 'paid';
  createdAt: string;
  txHash?: string;
  sender?: string;
}

export interface CreatePaymentIntentInput {
  destination?: string;
  amount: string;
  asset?: string;
  memo?: string;
  network?: StellarNetwork;
}

export interface ConfirmPaymentInput {
  txHash: string;
  sender: string;
}
