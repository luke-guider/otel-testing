import { config } from '@dotenvx/dotenvx';
import faroUploader from '@grafana/faro-rollup-plugin';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  config({
    path: '.env',
  });

  const { FARO_API_KEY } = process.env;

  if (!FARO_API_KEY) {
    throw new Error('FARO_API_KEY is not set');
  }

  return {
    plugins: [
      faroUploader({
        appName: 'testing',
        endpoint: 'https://faro-api-prod-gb-south-1.grafana.net/faro/api/v1',
        appId: '105',
        stackId: '1287120',
        // instructions on how to obtain your API key are in the documentation
        // https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/sourcemap-upload-plugins/#obtain-an-api-key
        apiKey: FARO_API_KEY,
        gzipContents: true,
      }),
    ],
  };
});
