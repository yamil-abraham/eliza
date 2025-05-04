#!/bin/bash

# Start the client in the background
cd /workspaces/eliza
pnpm --filter client dev &

# Wait a moment for the client to start
sleep 2

# Start the agent with embeddings disabled
cd /workspaces/eliza
DISABLE_EMBEDDINGS=true pnpm --filter "@elizaos/agent" start --isRoot
