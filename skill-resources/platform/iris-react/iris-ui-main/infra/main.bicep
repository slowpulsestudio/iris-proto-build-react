// Iris UI — Azure Infrastructure
// Subscription-scope deployment that provisions per-environment Azure resources.
//
// Usage:
//   az deployment sub create \
//     --location westus \
//     --template-file infra/main.bicep \
//     --parameters prefix=irisui-dev location=westus

targetScope = 'subscription'

// --- Parameters ---

@description('Resource name prefix (e.g. irisui-dev)')
param prefix string

@description('Azure region for all resources')
param location string

@description('Entra ID tenant ID (for Key Vault tenant binding)')
param tenantId string = subscription().tenantId

@description('Tags applied to all resources')
param tags object = {
  project: 'iris-ui'
  environment: 'dev'
  managedBy: 'bicep'
}

// --- Derived names ---
var rgName = '${prefix}-rg'
var kvName = '${prefix}-kv'

// --- Resource Group ---

module rg 'modules/rg.bicep' = {
  name: '${prefix}-rg-deployment'
  params: {
    name: rgName
    location: location
    tags: tags
  }
}

// --- Key Vault ---

module kv 'modules/keyvault.bicep' = {
  name: '${prefix}-kv-deployment'
  scope: resourceGroup(rgName)
  dependsOn: [rg]
  params: {
    name: kvName
    location: location
    tenantId: tenantId
    tags: tags
  }
}

// --- Managed Identity ---

module identity 'modules/identity.bicep' = {
  name: '${prefix}-identity-deployment'
  scope: resourceGroup(rgName)
  dependsOn: [rg]
  params: {
    prefix: prefix
    location: location
    tags: tags
  }
}

// --- Role Assignments ---

module roles 'modules/roles.bicep' = {
  name: '${prefix}-roles-deployment'
  scope: resourceGroup(rgName)
  dependsOn: [kv, identity]
  params: {
    keyVaultId: kv.outputs.id
    implementorPrincipalId: identity.outputs.implementorPrincipalId
  }
}

// --- Outputs ---

@description('Resource group name')
output resourceGroupName string = rg.outputs.name

@description('Key Vault name')
output keyVaultName string = kv.outputs.name

@description('Key Vault URI')
output keyVaultUri string = kv.outputs.uri

@description('Implementor Managed Identity client ID')
output implementorClientId string = identity.outputs.implementorClientId
