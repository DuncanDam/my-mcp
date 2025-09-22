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
      console.log('✅ Setup complete! Run "my-mcp config" then restart Claude Desktop.');
      break;

    case 'update':
      console.log('📦 Updating MCP Content Analyzer...');
      
      // Check if installed via installation script (has .install-method marker)
      const installMethodFile = join(rootDir, '.install-method');
      const { existsSync, readFileSync } = await import('fs');
      
      if (existsSync(installMethodFile)) {
        const installMethod = readFileSync(installMethodFile, 'utf8').trim();
        
        if (installMethod === 'script') {
          console.log('🔄 Detected script installation. Running automatic update...');
          console.log('');
          
          try {
            // Run the install script automatically
            await runCommand('bash', ['-c', 'curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash'], {
              stdio: 'inherit'
            });
            console.log('✅ Update completed successfully!');
            console.log('');
            console.log('📋 Next steps:');
            console.log('  1. Restart Claude Desktop to load the updated version');
            console.log('  2. Test with: my-mcp test');
            console.log('');
          } catch (error) {
            console.error('❌ Update failed. You can try manually with:');
            console.log('   curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash');
            throw error;
          }
          return;
        }
      }
      
      // Use npm method for npm installations
      await runCommand('npm', ['update', '-g', 'my-mcp']);
      console.log('✅ Update complete!');
      break;

    case 'config':
      console.log('🔧 Running configuration wizard...');
      await runCommand('node', ['scripts/config-wizard.js']);
      console.log('\n🔧 Generating Claude Desktop configuration...');
      await runCommand('node', ['scripts/generate-config.js']);
      break;

    case 'test':
      console.log('🧪 Testing MCP server connection...');
      await runCommand('node', ['scripts/test-connection.js']);
      break;

    case 'validate':
      console.log('🔍 Validating configuration paths...');
      await runCommand('node', ['scripts/validate-paths.js']);
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
  setup    Setup dependencies and basic configuration
  start    Build and start the MCP server
  config   Interactive configuration wizard (paths, settings)
  test     Test server connection
  validate Validate configuration paths
  update   Automatically update to latest version
  dev      Start in development mode
  help     Show this help message

Quick Start:
  1. my-mcp setup
  2. my-mcp config (configure Excel and content catalog paths)
  3. Restart Claude Desktop (MCP server starts automatically)
  4. Test in Claude Desktop

For more info: https://github.com/DuncanDam/my-mcp
      `);
      break;
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});