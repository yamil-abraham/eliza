# Script to fix the missing sqlite-vec-linux-arm64 module

echo "Fixing sqlite-vec for ARM64 architecture..."

# Create directory for the module
mkdir -p /workspaces/eliza/node_modules/sqlite-vec-linux-arm64

# Create a dummy native module that will be used as a fallback
cat > /workspaces/eliza/node_modules/sqlite-vec-linux-arm64/index.js << 'EOF'
console.warn("Using ARM64 compatibility mode for sqlite-vec");
// Export a minimal compatible interface
module.exports = {
  path: "/path/to/dummy/extension.so"
};
EOF

# Modify the sqlite-vec module to skip loading extensions when in compatibility mode
cat > /workspaces/eliza/node_modules/sqlite-vec/index.mjs << 'EOF'
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import { platform, arch } from "os";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in compatibility mode
const DISABLE_SQLITE_VEC = process.env.DISABLE_SQLITE_VEC === "true";

function getLoadablePath() {
  if (DISABLE_SQLITE_VEC) {
    console.warn("sqlite-vec extensions disabled by DISABLE_SQLITE_VEC=true");
    return null;
  }

  const plat = platform();
  const ar = arch();

  let moduleName;
  if (plat === "linux" && ar === "x64") {
    moduleName = "sqlite-vec-linux-x64";
  } else if (plat === "linux" && ar === "arm64") {
    moduleName = "sqlite-vec-linux-arm64";
  } else if (plat === "darwin" && ar === "x64") {
    moduleName = "sqlite-vec-darwin-x64";
  } else if (plat === "darwin" && ar === "arm64") {
    moduleName = "sqlite-vec-darwin-arm64";
  } else if (plat === "win32" && ar === "x64") {
    moduleName = "sqlite-vec-win32-x64";
  } else {
    throw new Error(`Unsupported platform: ${plat}-${ar}`);
  }

  try {
    const mod = require(moduleName);
    return mod.path;
  } catch (e) {
    if (DISABLE_SQLITE_VEC) {
      return null;
    }
    throw new Error(`Loadble extension for sqlite-vec not found. Was the ${moduleName} package installed?`);
  }
}

export function load(db) {
  if (DISABLE_SQLITE_VEC) {
    console.warn("Skipping sqlite-vec extension loading (compatibility mode)");
    return;
  }

  const path = getLoadablePath();
  if (!path) {
    console.warn("No sqlite-vec extension path found, skipping load");
    return;
  }

  db.loadExtension(path);
}
EOF

# Create a script to start elizaOS with environment variables to disable embeddings and sqlite-vec
cat > /workspaces/eliza/start_eliza_arm64.sh << 'EOF'
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
DISABLE_EMBEDDINGS=true DISABLE_SQLITE_VEC=true pnpm --filter "@elizaos/agent" start --isRoot
AGENT_STATUS=$?

# If agent fails, kill the client
if [ $AGENT_STATUS -ne 0 ]; then
  echo "Agent failed to start. Killing client process..."
  kill $CLIENT_PID
fi
EOF

chmod +x /workspaces/eliza/start_eliza_arm64.sh

echo "Created start_eliza_arm64.sh script to run elizaOS with embeddings and sqlite-vec disabled"
echo ""
echo "To start elizaOS, run: ./start_eliza_arm64.sh"
