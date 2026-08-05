// Azure Kubernetes Service
// Workload Identity + OIDC issuer + Secrets Store CSI Driver add-on
// Single system node pool — sufficient for the nightly implementor workload

@description('AKS cluster name')
param name string

@description('Azure region')
param location string

@description('Kubernetes version (empty = latest stable)')
param kubernetesVersion string = ''

@description('System node pool VM size')
param nodeVmSize string = 'Standard_D2s_v3'

@description('System node pool min count')
param nodeCountMin int = 1

@description('System node pool max count')
param nodeCountMax int = 3

@description('Tags to apply')
param tags object = {}

resource aks 'Microsoft.ContainerService/managedClusters@2024-09-01' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    dnsPrefix: name
    kubernetesVersion: kubernetesVersion != '' ? kubernetesVersion : null

    oidcIssuerProfile: {
      enabled: true
    }
    securityProfile: {
      workloadIdentity: {
        enabled: true
      }
    }

    addonProfiles: {
      azureKeyvaultSecretsProvider: {
        enabled: true
        config: {
          enableSecretRotation: 'true'
          rotationPollInterval: '5m'
        }
      }
    }

    agentPoolProfiles: [
      {
        name: 'system'
        mode: 'System'
        vmSize: nodeVmSize
        enableAutoScaling: true
        minCount: nodeCountMin
        maxCount: nodeCountMax
        osType: 'Linux'
        osSKU: 'AzureLinux'
      }
    ]

    networkProfile: {
      networkPlugin: 'azure'
      networkPolicy: 'calico'
    }
  }
}

@description('AKS cluster name')
output name string = aks.name

@description('AKS cluster resource ID')
output id string = aks.id

@description('AKS OIDC issuer URL — used for Federated Identity Credentials')
output oidcIssuerUrl string = aks.properties.oidcIssuerProfile.issuerURL
