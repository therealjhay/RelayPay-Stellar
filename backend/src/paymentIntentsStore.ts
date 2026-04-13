import { randomUUID } from 'crypto';
import { StrKey } from '@stellar/stellar-sdk';
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  PaymentIntent,
  StellarNetwork,
} from './types.js';

const DEFAULT_DESTINATION =
  process.env.RECEIVER_PUBLIC_KEY ??
  'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBWE3EINNNKV';
const DEFAULT_NETWORK = (process.env.STELLAR_NETWORK as StellarNetwork) ?? 'testnet';

const intents = new Map<string, PaymentIntent>();

function isPositiveAmount(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value) && Number(value) > 0;
}

function assertStellarAddress(address: string, field: string): void {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new Error(`Invalid ${field}`);
  }
}

export function createIntent(input: CreatePaymentIntentInput): PaymentIntent {
  const destination = input.destination ?? DEFAULT_DESTINATION;
  const asset = input.asset ?? 'XLM';
  const network = input.network ?? DEFAULT_NETWORK;

  assertStellarAddress(destination, 'destination');

  if (!isPositiveAmount(input.amount)) {
    throw new Error('Amount must be a positive number');
  }

  const intent: PaymentIntent = {
    id: randomUUID(),
    destination,
    amount: input.amount,
    asset,
    memo: input.memo?.trim() || undefined,
    network,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  intents.set(intent.id, intent);
  return intent;
}

export function getIntent(id: string): PaymentIntent | null {
  return intents.get(id) ?? null;
}

export function confirmIntent(id: string, input: ConfirmPaymentInput): PaymentIntent {
  const intent = intents.get(id);

  if (!intent) {
    throw new Error('Payment intent not found');
  }
  if (!input.txHash?.trim()) {
    throw new Error('txHash is required');
  }
  assertStellarAddress(input.sender, 'sender');

  const updated: PaymentIntent = {
    ...intent,
    status: 'paid',
    txHash: input.txHash.trim(),
    sender: input.sender,
  };

  intents.set(id, updated);
  return updated;
}
