# Implementor Agent — Copilot CLI + MCP servers (Figma, GitHub)
# Runs as non-root user 1001 in AKS with readOnlyRootFilesystem.

FROM node:22-slim

# System deps: git, Python 3, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      python3 \
      python3-pip \
      curl \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PyJWT for GitHub App token generation
RUN pip3 install --no-cache-dir --break-system-packages PyJWT cryptography

# Install Copilot CLI
RUN curl -fsSL https://gh.io/copilot-install | bash

# Create non-root user matching K8s securityContext (uid 1001)
RUN groupadd -g 1001 implementor \
    && useradd -u 1001 -g 1001 -m -d /home/implementor -s /bin/bash implementor

# Copy agent entrypoint
COPY Agent/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER 1001
WORKDIR /home/implementor

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
