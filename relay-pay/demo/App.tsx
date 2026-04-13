import React, { useMemo, useState } from 'react';
import { RelayPayButton } from '../src/components/RelayPay';
import type { StellarNetwork, TransactionResult } from '../src/types';

interface PaymentIntent {
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

interface IntentFormState {
  amount: string;
  asset: string;
  memo: string;
  network: StellarNetwork;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export default function App(): React.ReactElement {
  const [form, setForm] = useState<IntentFormState>({
    amount: '10',
    asset: 'XLM',
    memo: 'demo-order-001',
    network: 'testnet',
  });
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<TransactionResult | null>(null);

  const intentSummary = useMemo(() => {
    if (!intent) return null;
    return `${intent.amount} ${intent.asset} to ${intent.destination.slice(0, 6)}...${intent.destination.slice(-6)}`;
  }, [intent]);

  const createIntent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingIntent(true);
    setIntentError(null);
    setPaymentError(null);
    setLastTx(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-intents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Failed to create payment intent');
      }

      const payload = (await response.json()) as { intent: PaymentIntent };
      setIntent(payload.intent);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unexpected error creating intent';
      setIntentError(message);
      setIntent(null);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const confirmPayment = async (tx: TransactionResult) => {
    if (!intent) return;

    const response = await fetch(`${API_BASE_URL}/api/payment-intents/${intent.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txHash: tx.hash,
        sender: tx.sourceAccount,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error ?? 'Failed to confirm payment');
    }

    const payload = (await response.json()) as { intent: PaymentIntent };
    setIntent(payload.intent);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
      <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs uppercase tracking-wider text-indigo-300">RelayPay Revamp</p>
          <h1 className="mt-2 text-3xl font-bold">Stellar Checkout Frontend + API</h1>
          <p className="mt-3 text-slate-300 text-sm">
            This demo now creates payment intents from a backend service and confirms transactions
            after wallet submission.
          </p>

          <form className="mt-6 space-y-4" onSubmit={createIntent}>
            <label className="block text-sm">
              <span className="text-slate-300">Amount</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Asset</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                value={form.asset}
                onChange={(e) => setForm((prev) => ({ ...prev, asset: e.target.value }))}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Memo</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                value={form.memo}
                onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Network</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-400"
                value={form.network}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, network: e.target.value as StellarNetwork }))
                }
              >
                <option value="testnet">testnet</option>
                <option value="mainnet">mainnet</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isCreatingIntent}
              className="w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400 disabled:opacity-70"
            >
              {isCreatingIntent ? 'Creating intent...' : 'Create payment intent'}
            </button>
          </form>

          {intentError && (
            <p className="mt-4 rounded-lg border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
              {intentError}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold">Checkout</h2>
          {!intent ? (
            <p className="mt-3 text-sm text-slate-300">
              Create a payment intent to generate a backend-approved destination and checkout request.
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Intent</p>
                <p className="mt-2 text-sm">{intentSummary}</p>
                <p className="mt-1 text-xs text-slate-400">ID: {intent.id}</p>
                <p className="mt-1 text-xs text-slate-400">Status: {intent.status}</p>
              </div>

              <div className="mt-4">
                <RelayPayButton
                  destination={intent.destination}
                  amount={intent.amount}
                  asset={intent.asset}
                  memo={intent.memo}
                  network={intent.network}
                  label={`Pay ${intent.amount} ${intent.asset}`}
                  onSuccess={async (tx) => {
                    setPaymentError(null);
                    setLastTx(tx);
                    try {
                      await confirmPayment(tx);
                    } catch (err) {
                      setPaymentError(
                        err instanceof Error ? err.message : 'Failed to confirm payment'
                      );
                    }
                  }}
                  onError={(err) => {
                    setLastTx(null);
                    setPaymentError(err.message);
                  }}
                />
              </div>
            </>
          )}

          {paymentError && (
            <p className="mt-4 rounded-lg border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
              {paymentError}
            </p>
          )}

          {lastTx && (
            <div className="mt-4 rounded-xl border border-emerald-800 bg-emerald-950/30 p-4">
              <p className="text-sm font-semibold text-emerald-200">Latest transaction</p>
              <p className="mt-2 break-all text-xs text-emerald-100">Hash: {lastTx.hash}</p>
              <p className="mt-1 text-xs text-emerald-100">Ledger: {lastTx.ledger}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
