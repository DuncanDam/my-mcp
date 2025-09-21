#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function checkForUpdates() {
  try {
    console.log('🔍 Checking for updates...');

    // Get current version
    const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
    const currentVersion = packageJson.version;

    // Check latest version on npm
    const latestVersion = execSync('npm view mcp-content-analyzer version', { encoding: 'utf8' }).trim();

    console.log(`Current version: ${currentVersion}`);
    console.log(`Latest version:  ${latestVersion}`);

    if (currentVersion !== latestVersion) {
      console.log('\n📦 Update available!');
      console.log('Run: mcp-content-analyzer update');
      return true;
    } else {
      console.log('\n✅ You have the latest version!');
      return false;
    }

  } catch (error) {
    console.warn('⚠️ Could not check for updates:', error.message);
    return false;
  }
}

async function autoUpdate() {
  try {
    console.log('📦 Updating MCP Content Analyzer...');

    // Update globally
    execSync('npm update -g mcp-content-analyzer', { stdio: 'inherit' });

    console.log('✅ Update completed!');
    console.log('🔄 Please restart the MCP server to use the new version.');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === 'update') {
    await autoUpdate();
  } else {
    await checkForUpdates();
  }
}

main();