# Iris UI — Azure Infrastructure

Bicep templates that provision per-environment Azure resources for iris-ui.

## Resources

| Module | Description |
|--------|-------------|
| `modules/rg.bicep` | Resource Group (subscription-scope) |
| `modules/keyvault.bicep` | Key Vault (RBAC auth, soft delete, purge protection) |
| `modules/aks.bicep` | AKS cluster (Workload Identity, OIDC, Secrets Store CSI) |
| `modules/identity.bicep` | Managed Identity for implementor workload |
| `modules/roles.bicep` | RBAC role assignments (Key Vault Secrets User) |

## Manual Deployment

```bash
az deployment sub create \
  --location westus \
  --template-file infra/main.bicep \
  --parameters prefix=irisui-dev location=westus
```

## Pipelines

| Pipeline | Trigger | Purpose |
|----------|---------|---------|
| `pipelines/deploy.yml` | Manual | Provision infra + deploy implementor CronJob to AKS |
| `pipelines/release.yml` | Merge to `main` | Lint, test, build, publish artifact |

## Nightly Implementor (K8s CronJob)

The `infra/k8s/base/implementor/` directory contains manifests for a nightly Figma implementation agent:

- **CronJob** — runs at 02:00 UTC (suspended by default, unsuspend in target env)
- **SecretProviderClass** — pulls PATs from Azure Key Vault via CSI driver
- **ServiceAccount** — workload identity federated credential
- **ConfigMap** — repo name and runtime flags

Placeholders to patch during deployment: `<implementor-wi-client-id>`, `<keyvault-name>`.

## Adding Resources

1. Create a new module in `infra/modules/`
2. Wire it into `infra/main.bicep`
3. Run the infra pipeline or deploy manually
