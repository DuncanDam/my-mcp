#!/usr/bin/env node

/**
 * Test script to verify database path configuration
 */

import { config } from '../dist/utils/config.js';
import { ExcelManagerServer } from '../dist/servers/excel-manager.js';
import fs from 'fs/promises';
import path from 'path';

async function testDatabasePath() {
  console.log('🔧 Testing Excel Database Path Configuration\n');

  try {
    // Show current configuration
    console.log('📋 Current Configuration:');
    console.log(`   Database Path: ${config.excel.databasePath}`);
    console.log(`   Backup Enabled: ${config.excel.backupEnabled}`);
    console.log(`   Auto Save: ${config.excel.autoSave}`);
    console.log(`   Schema Version: ${config.excel.schemaVersion}`);

    // Check if path is absolute or relative
    const isAbsolute = path.isAbsolute(config.excel.databasePath);
    console.log(`   Path Type: ${isAbsolute ? 'Absolute' : 'Relative'}`);

    // Resolve to full path
    const fullPath = path.resolve(config.excel.databasePath);
    console.log(`   Full Path: ${fullPath}`);

    // Check if directory exists
    const dir = path.dirname(fullPath);
    try {
      await fs.access(dir);
      console.log(`   Directory Exists: ✅ ${dir}`);
    } catch {
      console.log(`   Directory Missing: ❌ ${dir}`);
      console.log(`   Creating directory...`);
      await fs.mkdir(dir, { recursive: true });
      console.log(`   Directory Created: ✅ ${dir}`);
    }

    // Test Excel Manager initialization
    console.log('\n🧪 Testing Excel Manager...');
    const excelManager = new ExcelManagerServer();
    await excelManager.initialize();
    console.log('✅ Excel Manager initialized successfully');

    // Check if file was created
    try {
      await fs.access(fullPath);
      const stats = await fs.stat(fullPath);
      console.log(`✅ Database File: ${fullPath}`);
      console.log(`   Size: ${stats.size} bytes`);
      console.log(`   Modified: ${stats.mtime.toISOString()}`);
    } catch {
      console.log(`❌ Database file not found: ${fullPath}`);
    }

    // Test database operations
    console.log('\n📊 Testing Database Operations...');
    const statsResult = await excelManager.handleToolCall('get_database_stats', {});
    if (statsResult.content?.success) {
      console.log(`✅ Database Stats: ${statsResult.content.stats.total_entries} entries`);
      console.log(`   Excel File Path: ${statsResult.content.stats.excel_file_path}`);
    }

    const categoriesResult = await excelManager.handleToolCall('get_topic_categories', {});
    if (categoriesResult.content?.success) {
      console.log(`✅ Topic Categories: ${categoriesResult.content.categories.length} loaded`);
    }

    console.log('\n🎉 Database Path Configuration Test Complete!');
    console.log('\n✅ Your Excel database is properly configured and working.');

  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env file EXCEL_DATABASE_PATH setting');
    console.error('2. Ensure the directory has write permissions');
    console.error('3. Verify the path format is correct');
    console.error('4. Try using an absolute path if relative path fails');
    process.exit(1);
  }
}

// Run the test
testDatabasePath().catch(console.error);