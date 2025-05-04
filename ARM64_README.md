# elizaOS for ARM64 (Apple Silicon)

This branch contains modifications to run elizaOS on ARM64 architecture (Apple Silicon M1/M2/M3).

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yamil-abraham/eliza.git
   ```
    ```bash
   cd eliza
      ```
    ```bash
   git checkout arm64-compatibility
    ```

2. Set up the development container:
    - Open the project in VS Code with the Dev Containers extension
    - VS Code will detect the devcontainer configuration and prompt you to reopen in container
    - Click "Reopen in Container"

3. Run the ARM64 compatibility script:
    ```bash
    chmod +x fix_sqlite_vec_arm64.sh
    ```
    ```bash
    ./fix_sqlite_vec_arm64.sh
    ```

4. Start elizaOS:
    ```bash
    ./start_eliza_arm64.sh
    ```

5. Access the web interface at http://localhost:5173/

## What's Modified?
This branch includes:
- Modified devcontainer configuration for ARM64
- Compatibility scripts for missing native modules
- Environment variable settings to disable problematic features

## Limitations
Some features are disabled in ARM64 compatibility mode:
- Vector search capabilities
- Embedding-based memory and retrieval

Basic chat functionality will still work.

## Troubleshooting
See the ARM64_COMPLETE_GUIDE.md for detailed troubleshooting information.
