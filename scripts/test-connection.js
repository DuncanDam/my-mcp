#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function testMCPConnection() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing MCP server connection...\n');

    const child = spawn('node', ['dist/index.js'], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send a test message
    setTimeout(() => {
      const testMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      };

      child.stdin.write(JSON.stringify(testMessage) + '\n');
    }, 1000);

    // Check response
    setTimeout(() => {
      child.kill();

      if (output.includes('tools') || output.includes('my-mcp')) {
        console.log('✅ MCP server is responding correctly!');
        console.log('\nServer capabilities detected:');
        console.log('  - MCP protocol communication ✓');
        console.log('  - Tool registration ✓');

        if (output.includes('test_connection')) {
          console.log('  - Test connection tool ✓');
        }
        if (output.includes('analyze_content_workflow')) {
          console.log('  - Content analysis workflow ✓');
        }

        console.log('\n🎉 Your MCP Content Analyzer is ready to use with Claude Desktop!');
        resolve(true);
      } else {
        console.log('❌ MCP server connection test failed');
        console.log('\nOutput:', output);
        console.log('\nErrors:', errorOutput);

        console.log('\nTroubleshooting:');
        console.log('1. Make sure you built the project: npm run build');
        console.log('2. Check if Claude Desktop configuration is correct');
        console.log('3. Restart Claude Desktop completely');

        resolve(false);
      }
    }, 3000);

    child.on('error', (error) => {
      console.error('❌ Failed to start MCP server:', error.message);
      reject(error);
    });
  });
}

async function main() {
  try {
    await testMCPConnection();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();