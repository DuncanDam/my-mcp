#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function runCommand(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${cmd} ${args.join(' ')}`);
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

async function setupDirectories() {
  console.log('📁 Creating necessary directories...');

  const dirs = [
    join(rootDir, 'data'),
    join(rootDir, 'logs'),
    join(rootDir, 'dist')
  ];

  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    }
  });
}

async function installPlaywright() {
  console.log('🎭 Installing Playwright browsers...');
  try {
    await runCommand('npx', ['playwright', 'install', 'chromium', '--with-deps']);
    console.log('  ✅ Playwright installed successfully');
  } catch (error) {
    console.warn('  ⚠️ Playwright installation failed, you may need to install manually');
    console.warn('  Run: npx playwright install chromium');
  }
}

async function main() {
  console.log('🚀 Setting up MCP Content Analyzer dependencies...\n');

  try {
    await setupDirectories();
    await installPlaywright();

    console.log('\n✅ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: mcp-content-analyzer config');
    console.log('2. Restart Claude Desktop');
    console.log('3. Run: mcp-content-analyzer start');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();