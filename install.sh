#!/bin/bash

# MCP Content Analyzer Installation Script
# This script bypasses npm issues and installs directly from GitHub

set -e

# Cleanup function
cleanup() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        echo "🧹 Cleaning up temporary files..."
        rm -rf "$TEMP_DIR"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo "🔍 MCP Content Analyzer - Installation Script"
echo "=============================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is required but not installed."
    exit 1
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    exit 1
fi

# Get npm global directory
NPM_PREFIX=$(npm config get prefix)
if [ -z "$NPM_PREFIX" ]; then
    echo "❌ Error: Could not determine npm global directory."
    exit 1
fi

INSTALL_DIR="$NPM_PREFIX/lib/node_modules/my-mcp"
BIN_DIR="$NPM_PREFIX/bin"
TEMP_DIR=$(mktemp -d)

echo "📁 Installation directory: $INSTALL_DIR"
echo "🔗 Binary directory: $BIN_DIR"

# Clean up any existing installation
if [ -d "$INSTALL_DIR" ]; then
    echo "🧹 Removing existing installation..."
    rm -rf "$INSTALL_DIR"
fi

if [ -f "$BIN_DIR/my-mcp" ]; then
    echo "🧹 Removing existing binary link..."
    rm -f "$BIN_DIR/my-mcp"
fi

# Clone the repository
echo "📥 Downloading from GitHub..."
cd "$TEMP_DIR"
git clone https://github.com/DuncanDam/my-mcp.git

# Verify clone was successful
if [ ! -d "$TEMP_DIR/my-mcp" ]; then
    echo "❌ Error: Failed to clone repository"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy to installation directory
echo "📦 Installing files..."
mkdir -p "$(dirname "$INSTALL_DIR")"
cp -r "$TEMP_DIR/my-mcp" "$INSTALL_DIR"

# Verify installation
if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ Error: Failed to install files"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Install dependencies and build
echo "🔧 Installing dependencies..."
cd "$INSTALL_DIR"
if ! npm install --silent; then
    echo "❌ Error: Failed to install dependencies"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "🏗️  Building TypeScript..."
if ! npm run build; then
    echo "❌ Error: Failed to build TypeScript"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "🧹 Cleaning dev dependencies..."
if ! npm prune --production; then
    echo "⚠️  Warning: Failed to clean dev dependencies, continuing..."
fi

# Create installation method marker
echo "script" > "$INSTALL_DIR/.install-method"

# Create binary symlink
echo "🔗 Creating binary link..."
chmod +x "$INSTALL_DIR/bin/mcp-analyzer.js"
if ! ln -sf "$INSTALL_DIR/bin/mcp-analyzer.js" "$BIN_DIR/my-mcp"; then
    echo "❌ Error: Failed to create binary link"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "You can now use the following commands:"
echo "  my-mcp --help    # Show help"
echo "  my-mcp setup     # Setup configuration"
echo "  my-mcp start     # Start the server"
echo "  my-mcp update    # Get update instructions"
echo ""
echo "Quick start:"
echo "  1. my-mcp setup"
echo "  2. my-mcp config"
echo "  3. Restart Claude Desktop"
echo "  4. my-mcp start"
echo ""
echo "📋 To update in the future:"
echo "  my-mcp update                # Automatic update (recommended)"
echo "  # Or manually:"
echo "  curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash"
