# GoHighLevel Automation Scripts

This document contains all the scripts needed to automate various aspects of your GoHighLevel setup for Houston Mobile Notary Pros.

## Table of Contents
1. [Pipeline Stage Management Script](#pipeline-stage-management-script)
2. [Setup Instructions](#setup-instructions)
3. [Configuration](#configuration)
4. [Troubleshooting](#troubleshooting)

## Pipeline Stage Management Script

This script helps you manage pipeline stages in your existing GoHighLevel pipelines. Since the GoHighLevel API v1 doesn't support creating new pipelines via API, you'll need to create pipelines manually in the UI first, then use this script to add stages.

### Script: `setup_ghl_pipelines.cjs`

```javascript
const axios = require('axios');

// --- CONFIGURATION ---
// Your GoHighLevel Location API key (JWT token)
const GHL_API_KEY = 'YOUR_GHL_API_KEY_HERE';
const LOCATION_ID = 'YOUR_LOCATION_ID_HERE';

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
```

## Setup Instructions

### Prerequisites

1. **Node.js**: Make sure you have Node.js installed (version 14 or higher)
2. **PNPM**: Your package manager (as specified in your project)
3. **GoHighLevel Account**: With API access enabled

### Installation Steps

1. **Install Dependencies**
   ```bash
   pnpm install axios
   ```

2. **Get Your API Credentials**
   - Log into your GoHighLevel account
   - Navigate to Settings > Business Info
   - Copy your Location API Key (it's a JWT token that looks like `eyJhbGci...`)
   - Copy your Location ID (looks like `oUvYNTw2Wvul7JSJplqQ`)

3. **Configure the Script**
   - Open `setup_ghl_pipelines.cjs`
   - Replace `YOUR_GHL_API_KEY_HERE` with your actual API key
   - Replace `YOUR_LOCATION_ID_HERE` with your actual Location ID
   - Update `pipelineName` if you want to target a different pipeline

4. **Run the Script**
   ```bash
   node setup_ghl_pipelines.cjs
   ```

## Configuration

### Available Pipelines in Your Account

Based on your current setup, you have these pipelines:

1. **HMNP - Client Support Tickets**
   - New Support Ticket Submitted
   - Ticket Acknowledged & Queued
   - Assigned to Support Staff
   - Investigation in Progress
   - Awaiting Client Response
   - Resolution Proposed / Action Taken
   - Client Confirmed Resolution
   - Ticket Resolved & Closed

2. **HMNP - Lead Engagement & Sales Funnel**
   - New Inquiry Received
   - Initial Contact Attempted
   - Needs Assessment & Qualification
   - Information / Quote Provided
   - Follow-Up Scheduled
   - Ready for Booking / Transition to Service
   - Not a Fit / Opportunity Lost
   - Nurturing - Long Term

3. **HMNP - Service Booking & Execution**
   - Booking Request Received
   - Awaiting Deposit Payment
   - Deposit Paid / Booking Confirmed
   - Service Scheduled & Assigned
   - Pre-Service Reminders Sent
   - Day of Service / In Progress
   - Service Completed Successfully
   - Feedback Request Sent
   - Payment Finalized / Closed
   - Archived - Issue / Refund

4. **Houston Mobile Notary Pros - Lead Pipeline**
   - New Lead
   - Contacted
   - Quote Sent
   - Booked
   - Service Complete
   - Follow-up

### Customizing Stage Lists

You can modify the `additionalStages` array to add different stages:

```javascript
const additionalStages = [
    "Your Custom Stage 1",
    "Your Custom Stage 2",
    // Add more stages as needed
];
```

### Targeting Different Pipelines

To update a different pipeline, change the `pipelineName` variable:

```javascript
const pipelineName = 'HMNP - Lead Engagement & Sales Funnel';
// or
const pipelineName = 'HMNP - Client Support Tickets';
// or any other pipeline name
```

## Troubleshooting

### Common Issues and Solutions

1. **"Api key is invalid" Error**
   - Ensure your API key is correctly copied
   - Check that you're using the Location API key, not an Agency key
   - Verify the key hasn't expired

2. **"No pipelines found" Error**
   - Verify your Location ID is correct
   - Ensure your API key has the necessary permissions
   - Check that pipelines exist in your GoHighLevel account

3. **"Pipeline not found" Error**
   - Double-check the pipeline name matches exactly (case-sensitive)
   - Run the script once to see available pipeline names
   - Update the `pipelineName` variable accordingly

4. **Syntax Errors**
   - If you see syntax errors about quotes, ensure you're not using smart quotes
   - Use straight quotes: `'` or `"` not `'` or `"`
   - Check for any special characters in your strings

### API Limitations

- **Cannot create pipelines**: GoHighLevel API v1 doesn't support creating new pipelines via API
- **Cannot delete stages**: The API doesn't support removing individual stages
- **Rate limits**: 100 requests per 10 seconds, 200,000 per day

### Getting Help

- **GoHighLevel Support**: For API-specific issues
- **Developer Slack**: https://www.gohighlevel.com/dev-slack
- **API Documentation**: https://public-api.gohighlevel.com/

## Next Steps

1. **Create Workflows**: Set up automated workflows for each pipeline stage
2. **Configure Triggers**: Add triggers for stage transitions
3. **Set Up Notifications**: Configure email/SMS notifications for stage changes
4. **Test Thoroughly**: Run through each pipeline with test contacts

## Additional Resources

- [GoHighLevel API Documentation](https://public-api.gohighlevel.com/)
- [Understanding Pipelines in GoHighLevel](https://help.gohighlevel.com/support/solutions/articles/155000001982-understanding-pipelines)
- [GoHighLevel Developer Resources](https://developers.gohighlevel.com/) 