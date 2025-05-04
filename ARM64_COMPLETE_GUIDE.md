# Running elizaOS on ARM64 (Apple Silicon)

## Issues with Native Modules

You're encountering two main issues with native modules on ARM64:

1. Missing tokenizers module: `@anush008/tokenizers-linux-arm64-gnu`
2. Missing SQLite vector extensions: `sqlite-vec-linux-arm64`

## Complete Solution

I've created a script that will fix both issues:

```bash
chmod +x fix_sqlite_vec_arm64.sh
./fix_sqlite_vec_arm64.sh
```

This script:
1. Creates compatibility modules for the missing native dependencies
2. Modifies the sqlite-vec module to skip loading extensions when in compatibility mode
3. Sets up a startup script that disables both problematic features

## Starting elizaOS

After running the fix script, start elizaOS with:

```bash
./start_eliza_arm64.sh
```

This will:
- Start the client on port 5173
- Start the agent with both embeddings and sqlite-vec disabled

## What Functionality Will Be Limited?

Running in compatibility mode means:
- Vector search capabilities will be disabled
- Embedding-based memory and retrieval will be limited
- Basic chat functionality will still work

## Accessing the Application

- Web Interface: http://localhost:5173/
- API: http://localhost:3000/

## Troubleshooting

If you still encounter issues:

1. Make sure both environment variables are set:
   ```bash
   DISABLE_EMBEDDINGS=true DISABLE_SQLITE_VEC=true
   ```

2. Check for any other native dependencies that might be causing issues

3. If all else fails, consider using an x64 architecture container or VM
