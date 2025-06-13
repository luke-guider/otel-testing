// /*instrumentation.ts*/
// import opentelemetry from '@opentelemetry/api';
// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// import {
//   defaultResource,
//   resourceFromAttributes,
// } from '@opentelemetry/resources';
// import {
//   MeterProvider,
//   PeriodicExportingMetricReader
// } from '@opentelemetry/sdk-metrics';
// import { NodeSDK } from '@opentelemetry/sdk-node';
// import {
//   ATTR_SERVICE_NAME,
//   ATTR_SERVICE_VERSION,
// } from '@opentelemetry/semantic-conventions';

// const resource = defaultResource().merge(
//   resourceFromAttributes({
//     [ATTR_SERVICE_NAME]: 'dice-server',
//     [ATTR_SERVICE_VERSION]: '0.1.0',
//   }),
// );

// const metricReader = new PeriodicExportingMetricReader({
//   // exporter: new ConsoleMetricExporter(),
//   exporter: new OTLPMetricExporter({
//       url: 'http://localhost:4318/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
//       headers: {}, // an optional object containing custom headers to be sent with each request
//     }),
//   // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
//   exportIntervalMillis: 10000,
// });

// const myServiceMeterProvider = new MeterProvider({
//   resource: resource,
//   readers: [metricReader],
// });

// // Set this MeterProvider to be global to the app being instrumented.
// opentelemetry.metrics.setGlobalMeterProvider(myServiceMeterProvider);

// const sdk = new NodeSDK({
//   resource: resourceFromAttributes({
//     [ATTR_SERVICE_NAME]: 'yourServiceName',
//     [ATTR_SERVICE_VERSION]: '1.0',
//   }),
//    traceExporter: new OTLPTraceExporter({
//     // optional - default url is http://localhost:4318/v1/traces
//     url: 'http://localhost:4318/v1/traces',
//     // optional - collection of custom headers to be sent with each request, empty by default
//     headers: {},
//   }),
//   // traceExporter: new ConsoleSpanExporter(),
//   // metricReader: metricReader,
// });

// sdk.start();
// 👆 This is from the more complex example

// 👇 This is from the node quickstart example
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  defaultResource,
  envDetector,
  hostDetector,
  osDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const resource = defaultResource().merge(
  resourceFromAttributes({
    ['service.name']: 'testing-app-service',
    [ATTR_SERVICE_VERSION]: '0.2.0',
    ['service.namespace']: 'app-service',
    ['deployment.environment']: 'testing',
  }),
);

// Add OTLP log exporter
const logExporter = new OTLPLogExporter({
  url: 'http://localhost:4318/v1/logs',
});

// Add log processor

const sdk = new NodeSDK({
  resource: resource,
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: 'http://localhost:4318/v1/metrics',
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  resourceDetectors: [envDetector, hostDetector, osDetector],
  logRecordProcessor: new SimpleLogRecordProcessor(logExporter),
});

sdk.start();
