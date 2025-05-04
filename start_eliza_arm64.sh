#!/bin/bash

echo "Starting elizaOS in ARM64 compatibility mode..."

# Start the client in the background
cd /workspaces/eliza
pnpm --filter client dev &
CLIENT_PID=$!

# Wait a moment for the client to start
sleep 2

# Start the agent with embeddings and sqlite-vec disabled
cd /workspaces/eliza
DISABLE_EMBEDDINGS=true DISABLE_SQLITE_VEC=true pnpm --filter client dev --host 0.0.0.0 &
AGENT_STATUS=$?

# If agent fails, kill the client
if [ $AGENT_STATUS -ne 0 ]; then
  echo "Agent failed to start. Killing client process..."
  kill $CLIENT_PID
fi
