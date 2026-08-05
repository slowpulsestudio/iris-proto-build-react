// Azure Key Vault
// RBAC authorization (no legacy access policies), soft delete + purge protection enabled

@description('Key Vault name')
param name string

@description('Azure region')
param location string

@description('Entra ID tenant ID')
param tenantId string

@description('Tags to apply')
param tags object = {}

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
    enabledForTemplateDeployment: true
  }
}

@description('Key Vault resource ID')
output id string = kv.id

@description('Key Vault name')
output name string = kv.name

@description('Key Vault URI')
output uri string = kv.properties.vaultUri
