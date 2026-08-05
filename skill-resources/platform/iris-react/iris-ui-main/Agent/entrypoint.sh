#!/usr/bin/env bash
set -euo pipefail

echo "=== Figma Implementation Agent starting at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# ─────────────────────────────────────────────────────────────────────────────
# 1. Read secrets from CSI-mounted files (AKS) or dummy k8s Secret (minikube)
# ─────────────────────────────────────────────────────────────────────────────
SECRETS_DIR="${SECRETS_DIR:-/mnt/secrets-store}"

read_secret() {
  local name="$1"
  local file="${SECRETS_DIR}/${name}"
  if [[ ! -f "$file" ]]; then
    echo "FATAL: Secret '${name}' not found at ${file}" >&2
    exit 1
  fi
  cat "$file"
}

GITHUB_APP_ID=$(read_secret "github-app-id")
GITHUB_APP_INSTALLATION_ID=$(read_secret "github-app-installation-id")
COPILOT_PAT=$(read_secret "copilot-pat")
FIGMA_PAT=$(read_secret "figma-pat")

PRIVATE_KEY_PATH="${SECRETS_DIR}/github-app-private-key"
if [[ ! -f "$PRIVATE_KEY_PATH" ]]; then
  echo "FATAL: github-app-private-key not found at ${PRIVATE_KEY_PATH}" >&2
  exit 1
fi

# Fix PEM key if Key Vault stored it with literal \n instead of newlines.
if grep -q '\\n' "$PRIVATE_KEY_PATH" 2>/dev/null; then
  FIXED_KEY="/tmp/github-app-private-key.pem"
  python3 -c 'from pathlib import Path; import sys; Path(sys.argv[2]).write_text(Path(sys.argv[1]).read_text().replace("\\n", "\n"))' \
    "$PRIVATE_KEY_PATH" "$FIXED_KEY"
  chmod 600 "$FIXED_KEY"
  PRIVATE_KEY_PATH="$FIXED_KEY"
  echo "  ℹ Fixed PEM key formatting (literal \\n → newlines)"
fi

echo "✓ Secrets loaded from ${SECRETS_DIR}"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Generate GitHub App installation token
# ─────────────────────────────────────────────────────────────────────────────
# Requires PyJWT: pip install PyJWT — must be pre-installed in the runtime image.
export GITHUB_APP_ID GITHUB_APP_INSTALLATION_ID PRIVATE_KEY_PATH
GITHUB_APP_TOKEN=$(python3 - <<'PY'
import json
import os
import time
import urllib.request

import jwt

app_id = os.environ["GITHUB_APP_ID"]
installation_id = os.environ["GITHUB_APP_INSTALLATION_ID"]
private_key_path = os.environ["PRIVATE_KEY_PATH"]

with open(private_key_path, "r", encoding="utf-8") as fh:
    private_key = fh.read()

now = int(time.time())
payload = {
    "iat": now - 60,
    "exp": now + 600,
    "iss": app_id,
}
encoded_jwt = jwt.encode(payload, private_key, algorithm="RS256")
if isinstance(encoded_jwt, bytes):
    encoded_jwt = encoded_jwt.decode("utf-8")

req = urllib.request.Request(
    f"https://api.github.com/app/installations/{installation_id}/access_tokens",
    data=b"{}",
    headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {encoded_jwt}",
        "User-Agent": "figma-implementation-agent",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
    },
    method="POST",
)

with urllib.request.urlopen(req) as response:
    body = json.loads(response.read().decode("utf-8"))

print(body["token"])
PY
)
echo "✓ GitHub App installation token generated (expires in 1 hour)"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Clone repository
# ─────────────────────────────────────────────────────────────────────────────
GITHUB_REPO="${GITHUB_REPO:?GITHUB_REPO env var is required}"
REPO_DIR="/tmp/repo"

echo "Cloning ${GITHUB_REPO}..."
git clone --depth=1 \
  -c "http.extraHeader=Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_APP_TOKEN" | base64 | tr -d '\n')" \
  "https://github.com/${GITHUB_REPO}.git" \
  "$REPO_DIR"
cd "$REPO_DIR"

# Configure git to use the token for push without persisting it in the remote URL.
git config http.extraHeader "Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_APP_TOKEN" | base64 | tr -d '\n')"

git config user.name "iris-ui-bot[bot]"
git config user.email "iris-ui-bot[bot]@users.noreply.github.com"

echo "✓ Repository cloned and git user configured"

# ─────────────────────────────────────────────────────────────────────────────
# 4. Build runtime MCP config (GitHub only; Figma uses REST API via PAT)
# ─────────────────────────────────────────────────────────────────────────────
MCP_CONFIG="$(mktemp /tmp/runtime-mcp-config.XXXXXX.json)"
chmod 600 "$MCP_CONFIG"

MCP_CONFIG_PATH="$MCP_CONFIG" GITHUB_APP_TOKEN="${GITHUB_APP_TOKEN:-}" python3 - <<'PY'
import json
import os

config = {"mcpServers": {}}

github_token = os.environ.get("GITHUB_APP_TOKEN", "")
if github_token:
    config["mcpServers"]["github"] = {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {"GITHUB_TOKEN": github_token},
    }

config["mcpServers"]["ag-mcp"] = {
    "command": "npx",
    "args": ["-y", "ag-mcp"],
}

with open(os.environ["MCP_CONFIG_PATH"], "w", encoding="utf-8") as fh:
    json.dump(config, fh, separators=(",", ":"))
    fh.write("\n")
PY

# Log which MCP servers were configured
if [[ -n "${GITHUB_APP_TOKEN:-}" ]]; then
  echo "  ✓ GitHub MCP server enabled"
fi
echo "  ✓ AG Grid MCP server enabled"
echo "  ✓ Figma REST API available (via FIGMA_PAT env var)"
echo "Runtime MCP config written"

# Export Figma PAT so the agent can use it with curl
export FIGMA_PAT

# ─────────────────────────────────────────────────────────────────────────────
# 5. Set auth env vars for Copilot CLI
# ─────────────────────────────────────────────────────────────────────────────
# GITHUB_TOKEN must be the Copilot PAT — GitHub App S2S tokens are rejected
# by api.githubcopilot.com with "Server-To-Server Tokens are not supported".
export GITHUB_TOKEN="$COPILOT_PAT"

# ─────────────────────────────────────────────────────────────────────────────
# 6. Run Figma Implementation Agent
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "═══ Running Figma Implementation Agent ═══"

echo "Copilot CLI version: $(copilot --version 2>&1 | head -1)"

COPILOT_UNSAFE_ALLOW_ALL="${COPILOT_UNSAFE_ALLOW_ALL:-false}"
COPILOT_APPROVAL_FLAGS=()
if [[ "${COPILOT_UNSAFE_ALLOW_ALL}" == "true" ]]; then
  echo "WARNING: Enabling unrestricted Copilot execution (--allow-all --no-ask-user)"
  COPILOT_APPROVAL_FLAGS+=(--allow-all --no-ask-user)
fi
copilot -p "You are working in the repository root. Execute the instructions in Agent/INSTRUCTION.md exactly. Use the Figma REST API (https://api.figma.com) with the FIGMA_PAT environment variable for authentication (header: X-Figma-Token)." \
  --model claude-opus-4.6 \
  "${COPILOT_APPROVAL_FLAGS[@]}" \
  --no-auto-update \
  --no-color \
  --additional-mcp-config "@${MCP_CONFIG}" || {
  RC=$?
  COPILOT_LOG_DIR="${HOME}/.copilot/logs"
  echo "FATAL: Figma implementation agent failed (exit code ${RC})" >&2
  if [[ -d "${COPILOT_LOG_DIR}" ]]; then
    echo "Copilot logs are available at: ${COPILOT_LOG_DIR}" >&2
    if [[ "${DEBUG:-false}" == "true" ]]; then
      tail -100 "${COPILOT_LOG_DIR}"/*.log 2>/dev/null || echo "No Copilot logs found" >&2
    else
      echo "Set DEBUG=true to print the last 100 lines of Copilot logs for troubleshooting." >&2
    fi
  else
    echo "No Copilot logs found at: ${COPILOT_LOG_DIR}" >&2
  fi
  exit "${RC}"
}

echo "✓ Figma implementation agent completed"
echo "=== Figma Implementation Agent finished at $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
