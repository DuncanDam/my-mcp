#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function loadEnvConfig() {
  const envPath = join(rootDir, '.env');
  const config = {};
  
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
  
  return config;
}

function validatePaths() {
  console.log('🔍 Validating MCP Content Analyzer paths...\n');
  
  const config = loadEnvConfig();
  let allValid = true;
  
  // Check Excel database path
  const excelPath = config.EXCEL_DATABASE_PATH || './data/content-database.xlsx';
  const resolvedExcelPath = resolve(rootDir, excelPath);
  const excelDir = dirname(resolvedExcelPath);
  
  console.log(`📊 Excel Database Path: ${excelPath}`);
  if (existsSync(excelDir)) {
    console.log(`   ✅ Directory exists: ${excelDir}`);
  } else {
    console.log(`   ❌ Directory does not exist: ${excelDir}`);
    allValid = false;
  }
  
  // Check content catalog path
  const catalogPath = config.CONTENT_CATALOG_PATH || './data/content-catalog-guidelines.md';
  const resolvedCatalogPath = resolve(rootDir, catalogPath);
  const catalogDir = dirname(resolvedCatalogPath);
  
  console.log(`\n📚 Content Catalog Path: ${catalogPath}`);
  if (existsSync(catalogDir)) {
    console.log(`   ✅ Directory exists: ${catalogDir}`);
  } else {
    console.log(`   ❌ Directory does not exist: ${catalogDir}`);
    allValid = false;
  }
  
  // Check if files exist
  if (existsSync(resolvedExcelPath)) {
    console.log(`   ✅ Excel file exists: ${resolvedExcelPath}`);
  } else {
    console.log(`   ⚠️  Excel file will be created: ${resolvedExcelPath}`);
  }
  
  if (existsSync(resolvedCatalogPath)) {
    console.log(`   ✅ Content catalog file exists: ${resolvedCatalogPath}`);
  } else {
    console.log(`   ⚠️  Content catalog file will be created: ${resolvedCatalogPath}`);
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('✅ All paths are valid!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: my-mcp config (to configure other settings)');
    console.log('2. Run: my-mcp start (to start the server)');
  } else {
    console.log('❌ Some paths are invalid!');
    console.log('\n🔧 To fix:');
    console.log('1. Run: my-mcp config (to reconfigure paths)');
    console.log('2. Or manually create the missing directories');
  }
  
  return allValid;
}

function main() {
  try {
    const isValid = validatePaths();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

main();
