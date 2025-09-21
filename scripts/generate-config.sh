#!/bin/bash

echo "⚙️ Generating Claude Desktop configuration..."

# Get current directory
CURRENT_DIR=$(pwd)

# Determine OS and config path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    CONFIG_DIR="$APPDATA/Claude"
else
    # Linux
    CONFIG_DIR="$HOME/.config/Claude"
fi

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Get Node.js path
NODE_PATH=$(which node)

# Generate config with proper escaping
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "content-analyzer": {
      "command": "NODE_PATH_PLACEHOLDER",
      "args": ["CURRENT_DIR_PLACEHOLDER/dist/index.js"],
      "env": {}
    }
  }
}
EOF

# Replace placeholders with actual values
sed -i '' "s|NODE_PATH_PLACEHOLDER|$NODE_PATH|g" "$CONFIG_FILE"
sed -i '' "s|CURRENT_DIR_PLACEHOLDER|$CURRENT_DIR|g" "$CONFIG_FILE"

echo "✅ Claude Desktop configuration created at: $CONFIG_FILE"
echo "🔄 Please restart Claude Desktop to load the new configuration"