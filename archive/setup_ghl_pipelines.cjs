const axios = require('axios');

// --- CONFIGURATION ---
// Your GoHighLevel Location API key (JWT token)
const GHL_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6Im9VdllOVHcyV3Z1bDdKU0pwbHFRIiwiY29tcGFueV9pZCI6Ik1LeHhKWEd5bTQxYWNucjZ6dEQyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAxOTg5NjI4MzY5LCJzdWIiOiJ1c2VyX2lkIn0.OhG7eQuY4ufsWR7zfLDRLw6rcADC1Gr6LQfnycYLhc0';
const LOCATION_ID = 'oUvYNTw2Wvul7JSJplqQ';

// API v1 Base URL
const BASE_URL = 'https://rest.gohighlevel.com/v1';

// Choose which pipeline to update
const pipelineName = 'HMNP - Service Booking & Execution';

// Additional stages to add to the chosen pipeline
const additionalStages = [
    "Collections",
    "Collections Review", 
    "On Hold - Payment Issue",
    "No-Show",
    "Payment Pending",
    "Payment Failed",
    "Refund Requested",
    "Refund Processed",
    "Review Requested",
    "Client Onboarding"
];

// Headers for API v1
const headers = {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json'
};

async function getPipelines() {
    try {
        console.log('Fetching pipelines...');
        const response = await axios.get(`${BASE_URL}/pipelines`, { 
            headers,
            params: {
                locationId: LOCATION_ID
            }
        });
        
        console.log(`Found ${response.data.pipelines.length} pipelines`);
        return response.data.pipelines || [];
    } catch (error) {
        console.error('Error fetching pipelines:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return [];
    }
}

async function updatePipelineStages(pipelineId, pipelineName, newStages) {
    // Since the API v1 doesn't support creating individual stages,
    // we'll update the entire pipeline with all stages at once
    try {
        console.log(`\nUpdating pipeline "${pipelineName}" with new stages...`);
        
        // Get current pipeline details
        const response = await axios.get(`${BASE_URL}/pipelines/${pipelineId}`, {
            headers,
            params: {
                locationId: LOCATION_ID
            }
        });
        
        const currentPipeline = response.data.pipeline;
        const existingStages = currentPipeline.stages || [];
        
        // Create a combined list of stages
        const allStages = [...existingStages];
        let maxPosition = existingStages.length > 0 ? 
            Math.max(...existingStages.map(s => s.position || 0)) : -1;
        
        // Add new stages that don't exist
        newStages.forEach(stageName => {
            if (!existingStages.find(s => s.name === stageName)) {
                maxPosition++;
                allStages.push({
                    name: stageName,
                    position: maxPosition
                });
            }
        });
        
        // Update the pipeline with all stages
        const updateResponse = await axios.put(`${BASE_URL}/pipelines/${pipelineId}`, {
            name: pipelineName,
            stages: allStages.map((stage, index) => ({
                id: stage.id,
                name: stage.name,
                position: index
            }))
        }, {
            headers
        });
        
        if (updateResponse.data.pipeline) {
            console.log('Pipeline updated successfully!');
            return updateResponse.data.pipeline;
        }
        
    } catch (error) {
        console.error('Error updating pipeline:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return null;
    }
}

async function displayPipelineInfo() {
    console.log('\n=== GoHighLevel Pipeline Stage Manager ===\n');
    console.log('This script will add missing stages to your existing pipelines.');
    console.log('Since GoHighLevel API v1 does not support creating pipelines,');
    console.log('please create your pipelines manually in the GoHighLevel UI first.\n');
    
    const pipelines = await getPipelines();
    
    if (pipelines.length === 0) {
        console.error('No pipelines found. Please check your API key and location ID.');
        return null;
    }
    
    console.log('Available pipelines:');
    pipelines.forEach((p, index) => {
        console.log(`${index + 1}. ${p.name} (${p.stages?.length || 0} stages)`);
    });
    
    return pipelines;
}

async function main() {
    const pipelines = await displayPipelineInfo();
    if (!pipelines) return;
    
    // Find the target pipeline
    const targetPipeline = pipelines.find(p => p.name === pipelineName);
    
    if (!targetPipeline) {
        console.log(`\nPipeline "${pipelineName}" not found.`);
        console.log('Please update the pipelineName variable to match one of the available pipelines.');
        return;
    }
    
    console.log(`\nFound pipeline: ${targetPipeline.name}`);
    const existingStageNames = (targetPipeline.stages || []).map(s => s.name);
    console.log('Existing stages:', existingStageNames);
    
    // Find stages that need to be added
    const stagesToAdd = additionalStages.filter(stage => !existingStageNames.includes(stage));
    
    if (stagesToAdd.length === 0) {
        console.log('\nAll desired stages already exist in the pipeline!');
        return;
    }
    
    console.log(`\nStages to add: ${stagesToAdd.join(', ')}`);
    
    // Update the pipeline with new stages
    const result = await updatePipelineStages(targetPipeline.id, targetPipeline.name, additionalStages);
    
    if (result) {
        console.log('\nPipeline update completed successfully!');
        console.log(`Total stages in pipeline: ${result.stages?.length || 0}`);
        console.log('\nPlease verify the changes in your GoHighLevel account.');
        console.log('You can reorder stages manually in the GoHighLevel UI if needed.');
    } else {
        console.log('\nFailed to update pipeline. Please check the error messages above.');
    }
}

// Run the script
main().catch(error => {
    console.error('Unexpected error:', error);
}); 