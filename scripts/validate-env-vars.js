#!/usr/bin/env node

/**
 * Validates that all environment variables in .env.template are actually used in the codebase
 */

import fs from 'fs/promises';
import path from 'path';

async function validateEnvVars() {
  console.log('🔍 Validating Environment Variables\n');

  try {
    // Read .env.template
    const templatePath = '.env.template';
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Extract environment variable names from template
    const envVarRegex = /^([A-Z_][A-Z0-9_]*)=/gm;
    const templateVars = new Set();
    let match;

    while ((match = envVarRegex.exec(templateContent)) !== null) {
      templateVars.add(match[1]);
    }

    console.log(`📋 Found ${templateVars.size} environment variables in .env.template:`);
    Array.from(templateVars).sort().forEach(varName => {
      console.log(`   - ${varName}`);
    });

    // Read config.ts to find used variables
    const configPath = 'src/utils/config.ts';
    const configContent = await fs.readFile(configPath, 'utf-8');

    // Extract used environment variables
    const usedVarRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
    const usedVars = new Set();

    while ((match = usedVarRegex.exec(configContent)) !== null) {
      usedVars.add(match[1]);
    }

    console.log(`\n🔧 Found ${usedVars.size} environment variables used in config.ts:`);
    Array.from(usedVars).sort().forEach(varName => {
      console.log(`   - ${varName}`);
    });

    // Find unused variables in template
    const unusedInTemplate = Array.from(templateVars).filter(varName => !usedVars.has(varName));
    const missingInTemplate = Array.from(usedVars).filter(varName => !templateVars.has(varName));

    console.log('\n📊 Validation Results:');

    if (unusedInTemplate.length === 0 && missingInTemplate.length === 0) {
      console.log('✅ Perfect match! All template variables are used and all used variables are in template.');
    } else {
      if (unusedInTemplate.length > 0) {
        console.log(`❌ Variables in template but NOT used in code (${unusedInTemplate.length}):`);
        unusedInTemplate.forEach(varName => {
          console.log(`   - ${varName} (should be removed from .env.template)`);
        });
      }

      if (missingInTemplate.length > 0) {
        console.log(`⚠️  Variables used in code but NOT in template (${missingInTemplate.length}):`);
        missingInTemplate.forEach(varName => {
          console.log(`   - ${varName} (should be added to .env.template)`);
        });
      }
    }

    // Show current .env status
    console.log('\n📁 Environment File Status:');
    try {
      await fs.access('.env');
      console.log('✅ .env file exists');
    } catch {
      console.log('⚠️  .env file missing (copy from .env.template)');
    }

    // Summary
    console.log('\n🎯 Summary:');
    console.log(`   Template Variables: ${templateVars.size}`);
    console.log(`   Used Variables: ${usedVars.size}`);
    console.log(`   Unused in Template: ${unusedInTemplate.length}`);
    console.log(`   Missing in Template: ${missingInTemplate.length}`);

    if (unusedInTemplate.length > 0 || missingInTemplate.length > 0) {
      console.log('\n🔧 Action Required: Update .env.template to match usage');
      process.exit(1);
    } else {
      console.log('\n✅ Environment variables are properly configured!');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation
validateEnvVars().catch(console.error);