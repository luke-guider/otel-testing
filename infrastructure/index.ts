import * as azure from '@pulumi/azure-native';
import * as containerapps from '@pulumi/azure-native/app';
import * as containerregistry from '@pulumi/azure-native/containerregistry';
import * as pulumi from '@pulumi/pulumi';

// Create a resource group
const resourceGroup = new azure.resources.ResourceGroup('grafana-alloy-rg', {
  location: 'uksouth',
});

// Create an Azure Container Registry
const registry = new containerregistry.Registry('grafanaalloyregistry', {
  resourceGroupName: resourceGroup.name,
  sku: {
    name: 'Basic',
  },
  adminUserEnabled: true,
});

// Create a Container App Environment
const environment = new containerapps.ManagedEnvironment('grafana-alloy-env', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
});

// Get the registry credentials
const registryCredentials = containerregistry.listRegistryCredentialsOutput({
  resourceGroupName: resourceGroup.name,
  registryName: registry.name,
});

// Create a Container App for the collector
const collectorApp = new containerapps.ContainerApp('grafana-alloy-collector', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  managedEnvironmentId: environment.id,
  configuration: {
    ingress: {
      external: true,
      targetPort: 4318,
    },
  },
  template: {
    containers: [
      {
        name: 'grafana-alloy',
        image: pulumi.interpolate`${registry.loginServer}/grafana-alloy:latest`,
        resources: {
          cpu: 0.5,
          memory: '1Gi',
        },
        env: [
          {
            name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
            value: 'http://localhost:4318',
          },
        ],
      },
    ],
  },
});

// Create a Container App for the API
const apiApp = new containerapps.ContainerApp('grafana-alloy-api', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  managedEnvironmentId: environment.id,
  configuration: {
    ingress: {
      external: true,
      targetPort: 3000,
    },
  },
  template: {
    containers: [
      {
        name: 'api',
        image: pulumi.interpolate`${registry.loginServer}/api:latest`,
        resources: {
          cpu: 0.5,
          memory: '1Gi',
        },
        env: [
          {
            name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
            value: collectorApp.configuration.apply(
              (cfg) => cfg?.ingress?.fqdn,
            ),
          },
          {
            name: 'OTEL_SERVICE_NAME',
            value: 'api-service',
          },
        ],
      },
    ],
  },
});

// Create a Container App for the Web
const webApp = new containerapps.ContainerApp('grafana-alloy-web', {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  managedEnvironmentId: environment.id,
  configuration: {
    ingress: {
      external: true,
      targetPort: 3000,
    },
  },
  template: {
    containers: [
      {
        name: 'web',
        image: pulumi.interpolate`${registry.loginServer}/web:latest`,
        resources: {
          cpu: 0.5,
          memory: '1Gi',
        },
        env: [
          {
            name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
            value: collectorApp.configuration.apply(
              (cfg) => cfg?.ingress?.fqdn,
            ),
          },
          {
            name: 'OTEL_SERVICE_NAME',
            value: 'web-service',
          },
          {
            name: 'API_URL',
            value: apiApp.configuration.apply((cfg) => cfg?.ingress?.fqdn),
          },
        ],
      },
    ],
  },
});

// Export the URLs
export const collectorUrl = collectorApp.configuration.apply(
  (cfg) => cfg?.ingress?.fqdn,
);
export const apiUrl = apiApp.configuration.apply((cfg) => cfg?.ingress?.fqdn);
export const webUrl = webApp.configuration.apply((cfg) => cfg?.ingress?.fqdn);
