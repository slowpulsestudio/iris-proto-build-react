// Resource Group
// Deployed at subscription scope by main.bicep

targetScope = 'subscription'

@description('Azure region for the resource group')
param location string

@description('Resource group name')
param name string

@description('Tags to apply to the resource group')
param tags object = {}

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: name
  location: location
  tags: tags
}

@description('Resource group name')
output name string = rg.name

@description('Resource group ID')
output id string = rg.id
