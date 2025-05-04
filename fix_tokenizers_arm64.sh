# Script to fix the missing @anush008/tokenizers-linux-arm64-gnu module

echo "Fixing native modules for ARM64 architecture..."

# Create directory for the module
mkdir -p /workspaces/eliza/node_modules/@anush008/tokenizers-linux-arm64-gnu

# Create a dummy native module that will be used as a fallback
cat > /workspaces/eliza/node_modules/@anush008/tokenizers-linux-arm64-gnu/index.js << 'EOF'
console.warn("Using ARM64 compatibility mode for tokenizers");
// Export a minimal compatible interface
module.exports = {
  Tokenizer: class Tokenizer {
    constructor() {
      console.warn("Tokenizer is running in compatibility mode");
    }
    encode(text) {
      return { ids: [], tokens: [] };
    }
    decode() {
      return "";
    }
  }
};
EOF

echo "Created compatibility module for @anush008/tokenizers-linux-arm64-gnu"

# Fix the tokenizers module to use our compatibility module
cat > /workspaces/eliza/node_modules/@anush008/tokenizers/index.js << 'EOF'
try {
  // Try to load the native module
  const binary = require("@anush008/tokenizers-linux-arm64-gnu");
  module.exports = binary;
} catch (e) {
  console.warn("Native tokenizers module not available, using compatibility mode");
  // Fallback to a minimal compatible interface
  module.exports = {
    Tokenizer: class Tokenizer {
      constructor() {
        console.warn("Tokenizer is running in compatibility mode");
      }
      encode(text) {
        return { ids: [], tokens: [] };
      }
      decode() {
        return "";
      }
    }
  };
}
EOF

echo "Modified @anush008/tokenizers to use compatibility mode"

# Create a script to start elizaOS with environment variables to disable embeddings
cat > /workspaces/eliza/start_eliza.sh << 'EOF'
#!/bin/bash

# Start the client in the background
cd /workspaces/eliza
pnpm --filter client dev &

# Wait a moment for the client to start
sleep 2

# Start the agent with embeddings disabled
cd /workspaces/eliza
DISABLE_EMBEDDINGS=true pnpm --filter "@elizaos/agent" start --isRoot
EOF

chmod +x /workspaces/eliza/start_eliza.sh

echo "Created start_eliza.sh script to run elizaOS with embeddings disabled"
echo ""
echo "To start elizaOS, run: ./start_eliza.sh"
