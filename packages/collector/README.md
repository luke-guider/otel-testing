# OpenTelemetry Collector

This package contains the configuration for the Grafana Alloy collector, which is used to collect, process, and export telemetry data.

## Configuration

The collector is configured using the `config.alloy` file, which defines:

- OTLP receivers for traces, metrics, and logs
- Processors for resource detection and attribute transformation
- Exporters for sending data to Grafana Cloud

## Environment Variables

The following environment variables are required:

- `GRAFANA_CLOUD_OTLP_ENDPOINT`: The OTLP endpoint for Grafana Cloud
- `GRAFANA_CLOUD_OTLP_AUTH`: The authentication token for Grafana Cloud

## Running Locally

1. Create a `.env` file with the required environment variables
2. Run the collector using Docker Compose:
   ```bash
   docker-compose up collector
   ```

## Ports

- 4317: OTLP gRPC
- 4318: OTLP HTTP
