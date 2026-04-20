#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "  AI Hub - Starting Development Server"
echo "=========================================="
echo ""

# Run npm from the app directory even if the script is launched elsewhere.
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
    echo ""
fi

echo "[INFO] Starting development server..."
echo ""
echo "Once started, open the URL shown below in your browser"
echo ""

npm run dev
