import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Demo app config - defaults to testnet
// WARNING: For mainnet usage, change STELLAR_NETWORK to 'mainnet'
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
