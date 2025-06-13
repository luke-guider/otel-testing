import { config } from '@dotenvx/dotenvx';
import faroUploader from '@grafana/faro-rollup-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Load environment variables
config({
  path: '.env',
  ignore: ['MISSING_ENV_FILE'],
});

const faroApiKey = process.env.VITE_FARO_API_KEY;
const faroEndpoint = process.env.VITE_FARO_ENDPOINT;

if (!faroApiKey) {
  throw new Error('VITE_FARO_API_KEY is not set');
}

if (!faroEndpoint) {
  throw new Error('VITE_FARO_ENDPOINT is not set');
}

export default defineConfig({
  plugins: [
    react(),
    faroUploader({
      appName: 'testing',
      endpoint: faroEndpoint,
      appId: '105',
      stackId: '1287120',
      // instructions on how to obtain your API key are in the documentation
      // https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/sourcemap-upload-plugins/#obtain-an-api-key
      apiKey: faroApiKey,
      gzipContents: true,
    }),
  ],
  define: {
    'process.env': {
      VITE_API_URL: process.env.VITE_API_URL,
    },
  },
});
