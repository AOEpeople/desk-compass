import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import * as process from 'process';

const otelSDK = new NodeSDK({
  metricReader: new PrometheusExporter({
    port: Number(process.env.METRICS_PORT ?? 3033),
  }),
});

export default otelSDK;
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
