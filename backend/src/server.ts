import cors from 'cors';
import express from 'express';
import { confirmIntent, createIntent, getIntent } from './paymentIntentsStore.js';
import type { ConfirmPaymentInput, CreatePaymentIntentInput } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'relay-pay-backend' });
});

app.post('/api/payment-intents', (req, res) => {
  try {
    const input = req.body as CreatePaymentIntentInput;
    const intent = createIntent(input);
    res.status(201).json({ intent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create payment intent';
    res.status(400).json({ error: message });
  }
});

app.get('/api/payment-intents/:id', (req, res) => {
  const intent = getIntent(req.params.id);
  if (!intent) {
    res.status(404).json({ error: 'Payment intent not found' });
    return;
  }
  res.json({ intent });
});

app.post('/api/payment-intents/:id/confirm', (req, res) => {
  try {
    const input = req.body as ConfirmPaymentInput;
    const intent = confirmIntent(req.params.id, input);
    res.json({ intent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm payment';
    const status = message === 'Payment intent not found' ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`RelayPay backend listening on http://localhost:${port}`);
});
