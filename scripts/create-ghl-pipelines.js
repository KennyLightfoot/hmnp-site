#!/usr/bin/env node

/**
 * Script to create all required pipelines with stages in GoHighLevel using Private Integrations v2 API
 * Creates multiple pipelines for different business processes
 * 
 * PIPELINE STRATEGY:
 * This script creates the following pipelines:
 * 1. Main Lead-to-Service Pipeline - Core customer journey
 * 2. Support Pipeline - For handling client support tickets
 * 3. Affiliate/Referral Pipeline - For managing referral partners
 * 4. RON Platform Pipeline - For Remote Online Notarization sessions
 * 
 * Usage: node scripts/create-ghl-pipelines.js
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

// All pipelines configuration
const pipelinesConfig = {
  // 1. Main Lead-to-Service Pipeline
  mainServicePipeline: {
    name: 'HMNP - Lead to Service Pipeline',
    description: 'Main customer journey from lead to completed service',
    stages: [
      {
        name: 'New Lead',
        position: 1,
        description: 'Initial lead capture and welcome sequence'
      },
      {
        name: 'Contacted',
        position: 2,
        description: 'Lead contacted and qualified'
      },
      {
        name: 'Quote Sent',
        position: 3,
        description: 'Quote/proposal sent to prospect'
      },
      {
        name: 'Booked',
        position: 4,
        description: 'Service booked and confirmed'
      },
      {
        name: 'Service Scheduled',
        position: 5,
        description: 'Notary assigned and appointment confirmed'
      },
      {
        name: 'Service Complete',
        position: 6,
        description: 'Service delivered successfully'
      },
      {
        name: 'Follow-up',
        position: 7,
        description: 'Post-service follow-up and reviews'
      }
    ]
  },
  
  // 2. Support Pipeline
  supportPipeline: {
    name: 'HMNP - Support Ticket Pipeline',
    description: 'Process for handling client support requests and issues',
    stages: [
      {
        name: 'New Ticket',
        position: 1,
        description: 'Support ticket received'
      },
      {
        name: 'Under Review',
        position: 2,
        description: 'Ticket being assessed'
      },
      {
        name: 'In Progress',
        position: 3,
        description: 'Working on resolution'
      },
      {
        name: 'Pending Client',
        position: 4,
        description: 'Waiting for client response'
      },
      {
        name: 'Resolved',
        position: 5,
        description: 'Issue has been resolved'
      },
      {
        name: 'Closed',
        position: 6,
        description: 'Ticket closed and feedback collected'
      }
    ]
  },
  
  // 3. Affiliate/Referral Pipeline
  affiliatePipeline: {
    name: 'HMNP - Affiliate & Referral Pipeline',
    description: 'Process for managing referral partners and affiliate program',
    stages: [
      {
        name: 'New Affiliate Application',
        position: 1,
        description: 'New referral partner application received'
      },
      {
        name: 'Review & Verification',
        position: 2,
        description: 'Verifying affiliate credentials'
      },
      {
        name: 'Onboarding',
        position: 3,
        description: 'Providing affiliate resources and training'
      },
      {
        name: 'Active Affiliate',
        position: 4,
        description: 'Actively sending referrals'
      },
      {
        name: 'Commission Calculation',
        position: 5,
        description: 'Calculating referral commissions'
      },
      {
        name: 'Payment Processed',
        position: 6,
        description: 'Commission payment completed'
      }
    ]
  },
  
  // 4. RON Platform Pipeline
  ronPipeline: {
    name: 'HMNP - Remote Online Notarization Pipeline',
    description: 'Process for handling Remote Online Notarization sessions',
    stages: [
      {
        name: 'RON Request',
        position: 1,
        description: 'RON session requested'
      },
      {
        name: 'Document Preparation',
        position: 2,
        description: 'Getting documents ready for RON'
      },
      {
        name: 'ID Verification',
        position: 3,
        description: 'Verifying signer identity (KBA/IDV)'
      },
      {
        name: 'Session Scheduled',
        position: 4,
        description: 'RON session date/time confirmed'
      },
      {
        name: 'Session Completed',
        position: 5,
        description: 'RON session successfully conducted'
      },
      {
        name: 'Documentation Complete',
        position: 6,
        description: 'All RON records properly stored'
      }
    ]
  }
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
      locationId: GHL_LOCATION_ID,
      description: pipelineData.description || ''
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
      `/locations/${GHL_LOCATION_ID}/pipelines/${pipelineId}/stages`, 
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

async function createSinglePipeline(pipelineConfig) {
  // Check if pipeline already exists
  const existingPipelines = await getExistingPipelines();
  const existingPipeline = existingPipelines.find(pipeline => 
    pipeline.name === pipelineConfig.name
  );

  if (existingPipeline) {
    console.log(`\n⏭️  Pipeline "${pipelineConfig.name}" already exists`);
    console.log(`   Pipeline ID: ${existingPipeline.id}`);
    return { 
      id: existingPipeline.id, 
      status: 'exists',
      successCount: 0,
      failureCount: 0
    };
  }

  // Create the pipeline
  const pipelineId = await createPipeline(pipelineConfig);
  if (!pipelineId) {
    console.error(`❌ Failed to create pipeline "${pipelineConfig.name}". Skipping.`);
    return { 
      id: null, 
      status: 'failed',
      successCount: 0,
      failureCount: 0
    };
  }

  // Add delay before creating stages
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create all stages
  console.log(`\n📋 Creating stages for "${pipelineConfig.name}":`);
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

  return {
    id: pipelineId,
    status: 'created',
    successCount,
    failureCount
  };
}

async function createAllPipelines() {
  console.log('🔄 Starting GHL pipelines creation with v2 API...\n');
  
  // Check existing pipelines
  printInfo('Checking existing pipelines...');
  const existingPipelines = await getExistingPipelines();
  printInfo(`Found ${existingPipelines.length} existing pipelines\n`);

  // Results tracking
  const results = {
    totalCreated: 0,
    totalExisting: 0,
    totalFailed: 0,
    stagesCreated: 0,
    stagesFailed: 0,
    pipelines: []
  };
  
  // Create each pipeline in sequence
  console.log('\n🚀 Creating Main Lead-to-Service Pipeline:');
  const mainPipelineResult = await createSinglePipeline(pipelinesConfig.mainServicePipeline);
  updateResults(results, mainPipelineResult, pipelinesConfig.mainServicePipeline);
  
  console.log('\n🚀 Creating Support Ticket Pipeline:');
  const supportPipelineResult = await createSinglePipeline(pipelinesConfig.supportPipeline);
  updateResults(results, supportPipelineResult, pipelinesConfig.supportPipeline);
  
  console.log('\n🚀 Creating Affiliate & Referral Pipeline:');
  const affiliatePipelineResult = await createSinglePipeline(pipelinesConfig.affiliatePipeline);
  updateResults(results, affiliatePipelineResult, pipelinesConfig.affiliatePipeline);
  
  console.log('\n🚀 Creating Remote Online Notarization Pipeline:');
  const ronPipelineResult = await createSinglePipeline(pipelinesConfig.ronPipeline);
  updateResults(results, ronPipelineResult, pipelinesConfig.ronPipeline);

  // Print summary report
  printPipelineSummary(results);
  
  return results;
}

function updateResults(results, pipelineResult, pipelineConfig) {
  if (pipelineResult.status === 'created') {
    results.totalCreated++;
    results.stagesCreated += pipelineResult.successCount;
    results.stagesFailed += pipelineResult.failureCount;
  } else if (pipelineResult.status === 'exists') {
    results.totalExisting++;
  } else {
    results.totalFailed++;
  }
  
  results.pipelines.push({
    name: pipelineConfig.name,
    id: pipelineResult.id,
    status: pipelineResult.status,
    stageCount: pipelineConfig.stages.length
  });
}

function printPipelineSummary(results) {
  console.log('\n📊 Pipelines Creation Summary:');
  console.log(`✅ Pipelines created: ${results.totalCreated}`);
  console.log(`⏭️  Pipelines already existing: ${results.totalExisting}`);
  console.log(`❌ Pipelines failed: ${results.totalFailed}`);
  console.log(`📋 Total pipelines configured: ${results.pipelines.length}`);
  console.log(`📋 Stages created successfully: ${results.stagesCreated}`);
  console.log(`❌ Stages failed: ${results.stagesFailed}`);
  
  if (results.totalFailed === 0 && results.stagesFailed === 0) {
    console.log('\n🎉 Complete pipelines setup successful!');
  } else {
    console.log('\n⚠️ Some pipelines or stages failed to create. Check the errors above.');
    console.log('You may need to create them manually in GHL.');
  }
  
  console.log('\n📋 Pipeline Details:');
  results.pipelines.forEach(pipeline => {
    const statusEmoji = pipeline.status === 'created' ? '✅ ' : 
                       pipeline.status === 'exists' ? '⏭️ ' : '❌ ';
    console.log(`${statusEmoji} ${pipeline.name} (${pipeline.status}) - ${pipeline.stageCount} stages`);
  });
  
  console.log('\nNext steps:');
  console.log('1. Verify pipelines in GHL: CRM > Pipeline Settings');
  console.log('2. Configure automation rules for stage transitions');
  console.log('3. Set up workflows that move contacts through stages');
  console.log('4. Run: node scripts/create-ghl-webhooks.js');
  
  // Show detailed pipeline stages guide
  console.log('\n📋 Pipeline Stages Guide:');
  
  // Main Service Pipeline
  console.log('\n1. MAIN SERVICE PIPELINE STAGES:');
  pipelinesConfig.mainServicePipeline.stages.forEach(stage => {
    console.log(`   - ${stage.name}: ${stage.description}`);
  });
  
  // Support Pipeline
  console.log('\n2. SUPPORT PIPELINE STAGES:');
  pipelinesConfig.supportPipeline.stages.forEach(stage => {
    console.log(`   - ${stage.name}: ${stage.description}`);
  });
  
  // Affiliate Pipeline
  console.log('\n3. AFFILIATE & REFERRAL PIPELINE STAGES:');
  pipelinesConfig.affiliatePipeline.stages.forEach(stage => {
    console.log(`   - ${stage.name}: ${stage.description}`);
  });
  
  // RON Pipeline
  console.log('\n4. RON PIPELINE STAGES:');
  pipelinesConfig.ronPipeline.stages.forEach(stage => {
    console.log(`   - ${stage.name}: ${stage.description}`);
  });
  
  console.log('\n💡 Pipeline Integration Tips:');
  console.log('1. Create opportunity automation rules to move leads through stages');
  console.log('2. Set up webhooks to sync pipeline changes with your web app');
  console.log('3. Trigger tags automatically when opportunities change stages');
  console.log('4. Use custom fields to store additional data for each opportunity');
}

// Run the script
createAllPipelines().catch(console.error);
