# RelayPay

A drop-in React component for accepting Stellar (XLM) payments with built-in wallet connection, transaction handling, and customization. Similar to Stripe's "Buy Button" but for the Stellar network.

---

## Features

- 🚀 **Zero-config wallet detection** — automatically detects Freighter, Albedo, and Lobstr
- 💳 **Simple payment flow** — wallet selection → connect → sign → submit
- ✅ **Toast notifications** — built-in success/error feedback
- 🎨 **Themeable** — light, dark, and custom CSS variable theming
- 🔒 **Testnet-first** — safe defaults, no real funds at risk by default
- 📦 **TypeScript** — fully typed API

---

## Installation

```bash
npm install relay-pay
```

> **Peer dependencies:** `react >= 18` and `react-dom >= 18` must be installed.

---

## Quick Start

```tsx
import { RelayPayButton } from 'relay-pay';

function Checkout() {
  return (
    <RelayPayButton
      destination="GABC...XYZ"
      amount="10"
      asset="XLM"
      memo="order-123"
      onSuccess={(tx) => console.log('Payment successful:', tx)}
      onError={(err) => console.error('Payment failed:', err)}
    />
  );
}
```

> ⚠️ **Testnet by default.** Add `network="mainnet"` only when you are ready for real transactions.

---

## Component API

### `<RelayPayButton />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `destination` | `string` | **required** | Stellar destination address |
| `amount` | `string` | **required** | Payment amount (e.g. `"10"`, `"0.5"`) |
| `asset` | `string` | `"XLM"` | Asset code (native XLM or issued asset code) |
| `memo` | `string` | — | Optional memo text attached to the transaction |
| `network` | `"testnet" \| "mainnet"` | `"testnet"` | Stellar network |
| `theme` | `"light" \| "dark" \| "custom"` | `"light"` | Visual theme |
| `label` | `string` | `"Pay {amount} {asset}"` | Button label text |
| `className` | `string` | — | Additional CSS class(es) |
| `onSuccess` | `(result: TransactionResult) => void` | — | Called on successful payment |
| `onError` | `(error: Error) => void` | — | Called on payment failure |

---

## Transaction Flow

1. User clicks button → wallet selection modal opens
2. User selects an installed Stellar wallet → connect request
3. Payment transaction is built with memo
4. Wallet requests user signature
5. Signed transaction is submitted to Horizon
6. `onSuccess` callback fires with the result

---

## Supported Wallets

| Wallet | Detection | Website |
|--------|-----------|---------|
| Freighter | `window.freighter` | https://www.freighter.app/ |
| Albedo | `window.albedo` | https://albedo.link/ |
| Lobstr | `window.lobstr` | https://lobstr.co/ |

---

## Theming

### CSS Variables

Override the default CSS variables for full customisation:

```css
:root {
  --relay-pay-primary: #6366f1;
  --relay-pay-primary-hover: #4f46e5;
  --relay-pay-primary-text: #ffffff;
  --relay-pay-border-radius: 0.5rem;
  --relay-pay-font-size: 1rem;
  --relay-pay-padding-x: 1.5rem;
  --relay-pay-padding-y: 0.625rem;
}
```

### Dark Mode

```tsx
<RelayPayButton ... theme="dark" />
```

---

## Hooks (Advanced)

You can use the underlying hooks for custom UI:

### `useWallet()`

```tsx
import { useWallet } from 'relay-pay';

const { installedWallets, connect, publicKey, isConnected } = useWallet();
```

### `usePayment(options)`

```tsx
import { usePayment } from 'relay-pay';

const { status, pay, result, error } = usePayment({
  destination: 'GABC...XYZ',
  amount: '10',
  asset: 'XLM',
  network: 'testnet',
});
```

---

## TypeScript Types

```tsx
import type {
  RelayPayButtonProps,
  TransactionResult,
  WalletProvider,
  StellarNetwork,
  PaymentStatus,
} from 'relay-pay';
```

---

## Development

```bash
cd relay-pay
npm install
npm run dev        # Start demo app at http://localhost:3000
npm run build      # Build demo app
npm run type-check # TypeScript check
```

---

## Security

- ✅ Private keys are **never** stored or transmitted
- ✅ All inputs are validated before transaction building
- ✅ Defaults to **testnet** — safe for development
- ⚠️ Only set `network="mainnet"` after thorough testnet testing

---

## License

MIT
