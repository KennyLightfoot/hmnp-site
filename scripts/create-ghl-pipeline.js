#!/usr/bin/env node

/**
 * Script to create sales pipeline with required stages in GoHighLevel using Private Integrations v2 API
 * Creates the complete lead-to-service pipeline automatically
 * 
 * PIPELINE STRATEGY:
 * This script creates the main service delivery pipeline as specified in GHL_COMPLETE_SETUP_MANUAL.md
 * 
 * OPTIONAL ADDITIONAL PIPELINES (create manually if needed):
 * - HMNP - Client Support Tickets (for post-service issues)
 * - HMNP - Event Registrations (for webinars/events)
 * - HMNP - Referral Tracking (for referral management)
 * 
 * Usage: node scripts/create-ghl-pipeline.js
 */

import {
  validateEnvVariables,
  makeGhlV2Request,
  getLocationPipelines,
  createLocationPipeline,
  printSuccess,
  printError,
  printInfo
} from './ghl-api-v2-utils.js';

// Validate environment variables
if (!validateEnvVariables()) {
  process.exit(1);
}

const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Pipeline configuration - matches GHL_COMPLETE_SETUP_MANUAL.md exactly
const pipelineConfig = {
  name: 'Houston Mobile Notary Pros - Lead Pipeline',
  stages: [
    {
      name: 'New Lead',
      position: 1
    },
    {
      name: 'Contacted',
      position: 2
    },
    {
      name: 'Quote Sent',
      position: 3
    },
    {
      name: 'Booked',
      position: 4
    },
    {
      name: 'Service Complete',
      position: 5
    },
    {
      name: 'Follow-up',
      position: 6
    }
  ]
};

async function getExistingPipelines() {
  try {
    const data = await getLocationPipelines();
    return data.pipelines || [];
  } catch (error) {
    printError('Error fetching existing pipelines: ' + error.message);
    printInfo('Note: Pipelines may need to be created manually in GHL dashboard.');
    return [];
  }
}

async function createPipeline(pipelineData) {
  try {
    console.log(`Creating pipeline: ${pipelineData.name}...`);
    
    const pipelinePayload = {
      name: pipelineData.name,
      locationId: GHL_LOCATION_ID
    };
    
    const result = await createLocationPipeline(pipelinePayload);
    printSuccess(`Created pipeline: ${pipelineData.name}`);
    console.log(`   Pipeline ID: ${result.id || result.pipeline?.id}`);
    return result.id || result.pipeline?.id;
    
  } catch (error) {
    printError(`Error creating pipeline: ${error.message}`);
    printInfo('Note: Pipelines may need to be created manually in GHL dashboard');
    printInfo('   Go to: CRM > Opportunities > Pipeline Settings');
    return null;
  }
}

async function createPipelineStage(pipelineId, stageData) {
  try {
    console.log(`  Creating stage: ${stageData.name}...`);
    
    const stagePayload = {
      name: stageData.name,
      position: stageData.position
    };
    
    const result = await makeGhlV2Request(
      `/opportunities/pipelines/${pipelineId}/stages`, 
      'POST', 
      stagePayload
    );
    
    printSuccess(`  Created stage: ${stageData.name} (ID: ${result.id || result.stage?.id})`);
    return true;
    
  } catch (error) {
    printError(`  Error creating stage ${stageData.name}: ${error.message}`);
    return false;
  }
}

async function createFullPipeline() {
  console.log('🔄 Starting GHL pipeline creation with v2 API...\n');
  
  // Check existing pipelines
  printInfo('Checking existing pipelines...');
  const existingPipelines = await getExistingPipelines();
  printInfo(`Found ${existingPipelines.length} existing pipelines\n`);

  // Check if our pipeline already exists
  const existingPipeline = existingPipelines.find(pipeline => 
    pipeline.name === pipelineConfig.name
  );

  if (existingPipeline) {
    console.log(`⏭️  Pipeline "${pipelineConfig.name}" already exists`);
    console.log(`   Pipeline ID: ${existingPipeline.id}`);
    console.log('\n🎉 Pipeline setup is complete!');
    return existingPipeline.id;
  }

  // Create the pipeline
  const pipelineId = await createPipeline(pipelineConfig);
  if (!pipelineId) {
    console.error('❌ Failed to create pipeline. Exiting.');
    return null;
  }

  // Add delay before creating stages
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create all stages
  console.log('\n📋 Creating pipeline stages:');
  let successCount = 0;
  let failureCount = 0;

  for (const stage of pipelineConfig.stages) {
    const success = await createPipelineStage(pipelineId, stage);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Rate limiting between stage creation
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Pipeline Creation Summary:');
  console.log(`✅ Pipeline created: ${pipelineConfig.name}`);
  console.log(`✅ Stages created successfully: ${successCount}`);
  console.log(`❌ Stages failed: ${failureCount}`);
  console.log(`📋 Total stages: ${pipelineConfig.stages.length}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 Complete pipeline setup successful!');
    console.log('\nPipeline Journey:');
    console.log('   New Lead → Contacted → Quote Sent → Booked → Service Complete → Follow-up');
    console.log('\nNext steps:');
    console.log('1. Verify pipeline in GHL: CRM > Pipeline Settings');
    console.log('2. Configure automation rules for stage transitions');
    console.log('3. Set up workflows that move contacts through stages');
    console.log('4. Test with a sample contact');
    console.log('\n💡 Optional: Consider additional pipelines for:');
    console.log('   - Client Support Tickets (post-service issues)');
    console.log('   - Event Registrations (webinars/workshops)');
    console.log('   - Referral Tracking (referral management)');
  } else {
    console.log('\n🔧 Some stages failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL.');
  }

  // Show stage descriptions
  console.log('\n📋 Stage Usage Guide:');
  pipelineConfig.stages.forEach((stage, index) => {
    const descriptions = [
      'Initial lead capture and welcome sequence',
      'Lead contacted and qualified',
      'Quote/proposal sent to prospect',
      'Service booked and confirmed',
      'Service delivered successfully',
      'Post-service follow-up and reviews'
    ];
    console.log(`   ${index + 1}. ${stage.name} - ${descriptions[index]}`);
  });

  return pipelineId;
}

// Run the script
createFullPipeline().catch(console.error); 