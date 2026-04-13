# RelayPay Stellar Stack

RelayPay is now a full-stack Stellar checkout starter:

1. **Frontend** (`relay-pay`) - React checkout UI and reusable `RelayPayButton` component.
2. **Backend** (`backend`) - Payment intent API for creating and confirming checkout sessions.
3. **Contract** (`contracts/payment-intent`) - Soroban smart contract scaffold for on-chain intent tracking.

## Architecture

```text
Frontend (Vite + React) ---> Backend API (Express) ---> Stellar Horizon + Soroban
```

- The frontend requests backend-generated payment intents.
- The backend issues destination/amount/network metadata and confirms submitted tx hashes.
- The Soroban contract package is included to evolve intent state from off-chain store to on-chain contract logic.

## Frontend revamp highlights

- New checkout flow in `relay-pay/demo/App.tsx`:
  - Create payment intent form (`amount`, `asset`, `memo`, `network`)
  - Intent-aware checkout summary
  - Wallet payment via `RelayPayButton`
  - Backend confirmation after successful Stellar submit
- Vite dev proxy added so frontend can call backend via `/api/*`.

## Backend API

Base URL: `http://localhost:4000`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health |
| `POST` | `/api/payment-intents` | Create payment intent |
| `GET` | `/api/payment-intents/:id` | Fetch intent |
| `POST` | `/api/payment-intents/:id/confirm` | Mark intent as paid |

### Create payment intent example

```bash
curl -X POST http://localhost:4000/api/payment-intents \
  -H "Content-Type: application/json" \
  -d '{"amount":"10","asset":"XLM","memo":"order-42","network":"testnet"}'
```

## Soroban contract scaffold

Location: `contracts/payment-intent`

Implemented contract methods:

- `initialize(admin)`
- `create_intent(payer, merchant, amount, asset, memo)`
- `mark_paid(intent_id, tx_hash)`
- `get_intent(intent_id)`

This gives contributors a concrete starting point for moving payment intent truth fully on-chain.

## Run locally

### 1) Frontend

```bash
cd relay-pay
npm install
npm run dev
```

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3) Soroban contract (optional for now)

```bash
cd contracts/payment-intent
cargo build --target wasm32-unknown-unknown --release
```

## Existing RelayPay component API

You can still use `RelayPayButton` as a standalone component:

```tsx
import { RelayPayButton } from 'relay-pay';

<RelayPayButton
  destination="GABC...XYZ"
  amount="10"
  asset="XLM"
  memo="order-123"
  network="testnet"
  onSuccess={(tx) => console.log(tx)}
  onError={(err) => console.error(err)}
/>;
```
