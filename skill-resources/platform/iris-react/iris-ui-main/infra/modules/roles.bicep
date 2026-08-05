// Role Assignments
// Key Vault Secrets User for the implementor workload identity.

@description('Key Vault resource ID')
param keyVaultId string

@description('Implementor Managed Identity principal ID')
param implementorPrincipalId string

// Well-known Azure built-in role definition IDs
var keyVaultSecretsUserRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')

// Reference existing Key Vault by ID for scope targeting
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: last(split(keyVaultId, '/'))
}

// --- Key Vault Secrets User: implementor MI → Key Vault ---

resource kvImplementorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultId, implementorPrincipalId, keyVaultSecretsUserRoleId)
  scope: keyVault
  properties: {
    principalId: implementorPrincipalId
    roleDefinitionId: keyVaultSecretsUserRoleId
    principalType: 'ServicePrincipal'
  }
}
