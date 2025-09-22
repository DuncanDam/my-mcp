#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function runCommand(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: rootDir,
      stdio: 'inherit',
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      console.log('🚀 Starting MCP Content Analyzer...');
      await runCommand('npm', ['run', 'build']);
      await runCommand('node', ['dist/index.js']);
      break;

    case 'setup':
      console.log('⚙️ Setting up MCP Content Analyzer...');
      await runCommand('npm', ['run', 'setup']);
      console.log('✅ Setup complete! Run "my-mcp start" to begin.');
      break;

    case 'update':
      console.log('📦 Updating MCP Content Analyzer...');
      
      // Check if installed via installation script (has .install-method marker)
      const installMethodFile = join(rootDir, '.install-method');
      const { existsSync, readFileSync } = await import('fs');
      
      if (existsSync(installMethodFile)) {
        const installMethod = readFileSync(installMethodFile, 'utf8').trim();
        
        if (installMethod === 'script') {
          console.log('🔄 Detected script installation. To update, please run:');
          console.log('');
          console.log('   curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash');
          console.log('');
          console.log('This will download and install the latest version.');
          return;
        }
      }
      
      // Use npm method for npm installations
      await runCommand('npm', ['update', '-g', 'my-mcp']);
      console.log('✅ Update complete!');
      break;

    case 'config':
      console.log('🔧 Generating Claude Desktop configuration...');
      await runCommand('node', ['scripts/generate-config.js']);
      break;

    case 'test':
      console.log('🧪 Testing MCP server connection...');
      await runCommand('node', ['scripts/test-connection.js']);
      break;

    case 'dev':
      console.log('🔧 Starting in development mode...');
      await runCommand('npm', ['run', 'dev']);
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(`
🔍 MCP Content Analyzer - Easy Distribution Edition

Usage: my-mcp <command>

Commands:
  setup    Setup dependencies and configuration
  start    Build and start the MCP server
  config   Generate Claude Desktop configuration
  test     Test server connection
  update   Update to latest version
  dev      Start in development mode
  help     Show this help message

Quick Start:
  1. my-mcp setup
  2. my-mcp config
  3. Restart Claude Desktop
  4. my-mcp start

For more info: https://github.com/DuncanDam/my-mcp
      `);
      break;
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});