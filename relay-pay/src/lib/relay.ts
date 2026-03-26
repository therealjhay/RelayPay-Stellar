import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
  StrKey,
} from '@stellar/stellar-sdk';
import type { StellarNetwork, TransactionResult } from '../types';

// Horizon server endpoints
const HORIZON_URLS: Record<StellarNetwork, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

// Network passphrases
const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: Networks.TESTNET,
  // WARNING: Use mainnet only for real transactions with real XLM
  mainnet: Networks.PUBLIC,
};

/**
 * Returns a Horizon server instance for the given network.
 */
export function getServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(HORIZON_URLS[network]);
}

/**
 * Returns the network passphrase for the given network.
 */
export function getNetworkPassphrase(network: StellarNetwork): string {
  return NETWORK_PASSPHRASES[network];
}

/**
 * Validates a Stellar public key (account address).
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Builds a Stellar payment transaction XDR string.
 *
 * @param sourcePublicKey - The sender's public key
 * @param destination - The recipient's public key
 * @param amount - Amount to send (as string, e.g. "10.5")
 * @param assetCode - Asset code, e.g. "XLM" or "USDC"
 * @param assetIssuer - Asset issuer address (omit for native XLM)
 * @param memo - Optional memo text
 * @param network - Stellar network to build for
 * @returns XDR-encoded transaction envelope string
 */
export async function buildPaymentTransaction(
  sourcePublicKey: string,
  destination: string,
  amount: string,
  assetCode: string,
  assetIssuer: string | undefined,
  memo: string | undefined,
  network: StellarNetwork
): Promise<string> {
  if (!isValidStellarAddress(sourcePublicKey)) {
    throw new Error('Invalid source account address');
  }
  if (!isValidStellarAddress(destination)) {
    throw new Error('Invalid destination address');
  }

  const server = getServer(network);
  const account = await server.loadAccount(sourcePublicKey);

  const asset =
    assetCode === 'XLM' && !assetIssuer
      ? Asset.native()
      : new Asset(assetCode, assetIssuer!);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(network),
  });

  builder.addOperation(
    Operation.payment({
      destination,
      asset,
      amount,
    })
  );

  if (memo) {
    builder.addMemo(Memo.text(memo));
  }

  builder.setTimeout(30);
  const tx = builder.build();
  return tx.toXDR();
}

/**
 * Submits a signed transaction XDR to the Stellar network.
 *
 * @param signedXdr - XDR-encoded signed transaction envelope
 * @param network - Stellar network to submit to
 * @returns TransactionResult with id, hash, and metadata
 */
export async function submitTransaction(
  signedXdr: string,
  sourcePublicKey: string,
  destination: string,
  amount: string,
  assetCode: string,
  memo: string | undefined,
  network: StellarNetwork
): Promise<TransactionResult> {
  const server = getServer(network);
  const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase(network));
  const response = await server.submitTransaction(tx);

  if (!response.successful) {
    throw new Error('Transaction failed on the network');
  }

  return {
    id: response.hash,
    hash: response.hash,
    ledger: response.ledger,
    createdAt: new Date().toISOString(),
    sourceAccount: sourcePublicKey,
    destination,
    amount,
    asset: assetCode,
    memo,
    networkPassphrase: getNetworkPassphrase(network),
  };
}
