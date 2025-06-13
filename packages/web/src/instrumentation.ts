import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// initializeFaro({
//   url: 'http://localhost:12345/collect',
//   app: { name: 'my-local-app', version: '0.1.0' },
// });

// const resource = defaultResource().merge(
//   resourceFromAttributes({
//     ['service.name']: 'testing-web-frontend',
//     [ATTR_SERVICE_VERSION]: '0.2.0',
//     ['service.namespace']: 'web-frontend',
//     ['deployment.environment']: 'testing',
//   }),
// );

// const exporter = new OTLPTraceExporter({
//   url: 'http://localhost:4318/v1/traces', // Default OTLP endpoint
// });

// const processor = new BatchSpanProcessor(exporter);

// const provider = new WebTracerProvider({
//   resource: resource,
//   spanProcessors: [processor],
// });

// provider.register();

export const faro = initializeFaro({
  url: 'https://faro-collector-prod-gb-south-1.grafana.net/collect/e3a18319428be08667c7059744ee5c0d',
  app: {
    name: 'web-frontend',
    version: '1.0.0',
    environment: 'testing',
  },

  instrumentations: [
    // Mandatory, omits default instrumentations otherwise.
    ...getWebInstrumentations(),

    // Tracing package to get end-to-end visibility for HTTP requests.
    new TracingInstrumentation(),
  ],
});
