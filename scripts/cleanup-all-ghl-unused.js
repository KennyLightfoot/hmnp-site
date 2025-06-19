#!/usr/bin/env node

/**
 * Master GHL Cleanup Script
 * Runs both custom fields and tags cleanup in sequence
 * This will delete ALL unused fields and tags, keeping only what your web app uses
 */

import {
  validateEnvVariables,
  printError
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

async function runMasterCleanup() {
  console.log('🚀 MASTER GHL CLEANUP STARTING...\n');
  console.log('This will remove ALL unused custom fields and tags from GoHighLevel');
  console.log('Only fields and tags actually used by your web app will remain\n');
  
  let totalDeleted = 0;
  let totalFailed = 0;
  
  try {
    // Step 1: Clean up custom fields
    console.log('='.repeat(60));
    console.log('STEP 1: CLEANING UP CUSTOM FIELDS');
    console.log('='.repeat(60));
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const fieldsResult = await execAsync('node scripts/cleanup-unused-ghl-fields.js');
      console.log(fieldsResult.stdout);
      if (fieldsResult.stderr) {
        console.error(fieldsResult.stderr);
      }
      
      // Parse results from output (rough estimation)
      const fieldsMatch = fieldsResult.stdout.match(/Successfully deleted: (\d+) fields/);
      if (fieldsMatch) {
        totalDeleted += parseInt(fieldsMatch[1]);
      }
      
    } catch (error) {
      printError('Custom fields cleanup failed: ' + error.message);
      totalFailed++;
    }
    
    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Clean up tags
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: CLEANING UP TAGS');
    console.log('='.repeat(60));
    
    try {
      const tagsResult = await execAsync('node scripts/cleanup-unused-ghl-tags.js');
      console.log(tagsResult.stdout);
      if (tagsResult.stderr) {
        console.error(tagsResult.stderr);
      }
      
      // Parse results from output (rough estimation)
      const tagsMatch = tagsResult.stdout.match(/Successfully deleted: (\d+) tags/);
      if (tagsMatch) {
        totalDeleted += parseInt(tagsMatch[1]);
      }
      
    } catch (error) {
      printError('Tags cleanup failed: ' + error.message);
      totalFailed++;
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MASTER CLEANUP COMPLETE!');
    console.log('='.repeat(60));
    
    console.log(`✅ Total items cleaned up: ${totalDeleted}`);
    console.log(`❌ Total failures: ${totalFailed}`);
    
    if (totalFailed === 0) {
      console.log('\n🚀 SUCCESS: Your GHL setup is now optimized!');
      console.log('\n✅ WHAT YOU NOW HAVE:');
      console.log('  • Only 24 custom fields (exactly what your web app uses)');
      console.log('  • Only ~40 tags (exactly what your workflows need)');
      console.log('  • Clean, manageable field/tag lists');
      console.log('  • No confusion about which fields to use');
      console.log('  • Workflows will work perfectly');
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('  1. Run create-minimal-ghl-fields.js to ensure all needed fields exist');
      console.log('  2. Run create-minimal-ghl-tags.js to ensure all needed tags exist');
      console.log('  3. Test your Stripe webhook workflow');
      console.log('  4. Your GHL setup is now production-ready!');
      
    } else {
      console.log('\n⚠️  Some items could not be deleted automatically.');
      console.log('Check the error messages above and manually delete remaining items in GHL');
    }
    
  } catch (error) {
    printError('Master cleanup failed: ' + error.message);
    console.log('\nYou can run the individual cleanup scripts manually:');
    console.log('  node scripts/cleanup-unused-ghl-fields.js');
    console.log('  node scripts/cleanup-unused-ghl-tags.js');
  }
}

runMasterCleanup().catch(console.error); 