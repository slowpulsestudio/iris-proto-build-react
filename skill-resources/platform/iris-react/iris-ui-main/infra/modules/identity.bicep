// Managed Identity for the implementor workload.
//
// Federated Identity Credentials are NOT created here — they are created by the deploy
// pipeline at deploy time using the OIDC issuer from AKS and the target k8s namespace.

@description('Resource name prefix')
param prefix string

@description('Azure region')
param location string

@description('Tags to apply')
param tags object = {}

resource implementorIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${prefix}-implementor-mi'
  location: location
  tags: tags
}

@description('Implementor Managed Identity client ID (for k8s ServiceAccount annotation)')
output implementorClientId string = implementorIdentity.properties.clientId

@description('Implementor Managed Identity principal ID (for RBAC)')
output implementorPrincipalId string = implementorIdentity.properties.principalId
