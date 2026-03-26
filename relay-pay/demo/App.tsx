import React, { useState } from 'react';
import { RelayPayButton } from '../src/components/RelayPay';
import type { TransactionResult } from '../src/types';

// WARNING: This demo uses TESTNET. Do not use real funds.
// Replace with your own testnet destination address for testing.
const TESTNET_DEMO_DESTINATION = 'GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBWE3EINNNKV';

export default function App(): React.ReactElement {
  const [lastTx, setLastTx] = useState<TransactionResult | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ⚡ RelayPay
          </h1>
          <p className="text-gray-600 text-lg">
            Drop-in Stellar payment component demo
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
            🔧 Testnet Mode
          </div>
        </div>

        {/* Examples */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic XLM payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Basic XLM Payment</h2>
            <p className="text-sm text-gray-500 mb-4">
              Simple 10 XLM payment with memo.
            </p>
            <RelayPayButton
              destination={TESTNET_DEMO_DESTINATION}
              amount="10"
              asset="XLM"
              memo="demo-order-001"
              network="testnet"
              onSuccess={(tx) => {
                setLastTx(tx);
                setLastError(null);
                console.log('Payment success:', tx);
              }}
              onError={(err) => {
                setLastError(err.message);
                setLastTx(null);
                console.error('Payment error:', err);
              }}
            />
          </div>

          {/* Custom label */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Custom Label</h2>
            <p className="text-sm text-gray-500 mb-4">
              Payment button with a custom label.
            </p>
            <RelayPayButton
              destination={TESTNET_DEMO_DESTINATION}
              amount="25"
              asset="XLM"
              label="Checkout with Stellar"
              network="testnet"
              onSuccess={(tx) => {
                setLastTx(tx);
                setLastError(null);
              }}
              onError={(err) => {
                setLastError(err.message);
                setLastTx(null);
              }}
            />
          </div>

          {/* Dark theme */}
          <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-6">
            <h2 className="font-semibold text-white mb-1">Dark Theme</h2>
            <p className="text-sm text-gray-400 mb-4">
              Using <code className="text-indigo-400">theme="dark"</code> prop.
            </p>
            <RelayPayButton
              destination={TESTNET_DEMO_DESTINATION}
              amount="5"
              asset="XLM"
              theme="dark"
              network="testnet"
              onSuccess={(tx) => {
                setLastTx(tx);
                setLastError(null);
              }}
              onError={(err) => {
                setLastError(err.message);
                setLastTx(null);
              }}
            />
          </div>

          {/* Custom class */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Custom Styling</h2>
            <p className="text-sm text-gray-500 mb-4">
              Using <code className="text-indigo-600">className</code> prop.
            </p>
            <RelayPayButton
              destination={TESTNET_DEMO_DESTINATION}
              amount="1"
              asset="XLM"
              label="Tip 1 XLM ☕"
              className="!bg-amber-500 hover:!bg-amber-600"
              network="testnet"
              onSuccess={(tx) => {
                setLastTx(tx);
                setLastError(null);
              }}
              onError={(err) => {
                setLastError(err.message);
                setLastTx(null);
              }}
            />
          </div>
        </div>

        {/* Transaction result / error display */}
        {lastTx && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-semibold text-green-800 mb-1">
              ✅ Last transaction
            </p>
            <dl className="text-xs text-green-700 space-y-0.5">
              <div>
                <dt className="inline font-medium">Hash: </dt>
                <dd className="inline font-mono break-all">{lastTx.hash}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Ledger: </dt>
                <dd className="inline">{lastTx.ledger}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Amount: </dt>
                <dd className="inline">
                  {lastTx.amount} {lastTx.asset}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {lastError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-800 mb-1">
              ❌ Last error
            </p>
            <p className="text-xs text-red-700 break-all">{lastError}</p>
          </div>
        )}

        {/* Usage snippet */}
        <div className="mt-8 bg-gray-900 rounded-2xl p-6 text-sm font-mono">
          <p className="text-gray-400 mb-3 font-sans text-xs uppercase tracking-wider">
            Usage
          </p>
          <pre className="text-green-400 overflow-auto whitespace-pre-wrap">
{`import { RelayPayButton } from 'relay-pay';

<RelayPayButton
  destination="GABC...XYZ"
  amount="10"
  asset="XLM"
  memo="order-123"
  network="testnet"
  onSuccess={(tx) => console.log(tx)}
  onError={(err) => console.error(err)}
/>`}
          </pre>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          ⚠️ This demo runs on Stellar <strong>testnet</strong>. No real funds are used.
        </p>
      </div>
    </div>
  );
}
