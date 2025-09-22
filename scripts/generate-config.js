#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function generateClaudeConfig() {
  const configDir = join(homedir(), 'Library', 'Application Support', 'Claude');
  const configFile = join(configDir, 'claude_desktop_config.json');

  // Ensure config directory exists
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Read existing config or create new one
  let config = { mcpServers: {} };
  if (existsSync(configFile)) {
    try {
      const existingConfig = JSON.parse(require('fs').readFileSync(configFile, 'utf8'));
      config = existingConfig;
    } catch (error) {
      console.warn('Warning: Could not parse existing config, creating new one');
    }
  }

  // Get Node.js path - use absolute path to avoid ENOENT errors
  const nodePath = process.execPath;

  // Add our MCP server
  config.mcpServers['my-mcp'] = {
    command: nodePath,
    args: [join(rootDir, 'dist', 'index.js')],
    env: {
      NODE_ENV: 'production'
    }
  };

  // Write config
  writeFileSync(configFile, JSON.stringify(config, null, 2));

  console.log('✅ Claude Desktop configuration updated!');
  console.log(`📁 Config location: ${configFile}`);
  console.log('\n⚠️ IMPORTANT: Restart Claude Desktop completely for changes to take effect');

  return configFile;
}

function main() {
  console.log('🔧 Generating Claude Desktop configuration...\n');

  try {
    generateClaudeConfig();

    console.log('\nNext steps:');
    console.log('1. Restart Claude Desktop (quit and reopen)');
    console.log('   → The MCP server will start automatically when Claude Desktop loads');
    console.log('2. Test with: "Please test the MCP connection by calling test_connection with message \\"Hello MCP!\\""');

  } catch (error) {
    console.error('❌ Configuration generation failed:', error.message);
    process.exit(1);
  }
}

main();