// Adapted from the Honeycomb docs
// https://docs.honeycomb.io/send-data/javascript-nodejs/opentelemetry-sdk/
// https://docs.honeycomb.io/send-data/logs/opentelemetry/sdk/javascript/

import { NodeSDK, logs } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { BunyanInstrumentation } from "@opentelemetry/instrumentation-bunyan";

const sdk: NodeSDK = new NodeSDK({
  logRecordProcessor: new logs.SimpleLogRecordProcessor(new OTLPLogExporter()),
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    new BunyanInstrumentation({}),
    getNodeAutoInstrumentations({
      // We recommend disabling fs automatic instrumentation because
      // it can be noisy and expensive during startup
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
    }),
  ],
});

console.log("Starting OpenTelemetry SDK");
sdk.start();

// Make sure the sdk is shutdown properly before exiting so pending logs are sent before stopping
process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});
