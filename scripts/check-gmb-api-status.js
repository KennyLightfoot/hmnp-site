#!/usr/bin/env node
/**
 * Check which Google Cloud projects have Google My Business API enabled
 * 
 * Note: This requires Google Cloud SDK (gcloud) to be installed and authenticated
 * 
 * Usage:
 *   node scripts/check-gmb-api-status.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECTS = [
  { name: 'Google my business', id: 'spheric-backup-465705-h4' },
  { name: 'HMNP', id: 'hmnp-6aa08' },
  { name: 'HMNP-1-FR', id: 'hmnp-1-fr' },
  { name: 'HMNP n8n Sheets', id: 'hmnp-n8n-sheets' },
];

console.log('🔍 Checking Google My Business API Status\n');
console.log('Note: This requires Google Cloud SDK (gcloud) to be installed.\n');
console.log('If gcloud is not installed, manually check each project:\n');
console.log('1. Go to: https://console.cloud.google.com/apis/library');
console.log('2. Switch to each project');
console.log('3. Search for "Google My Business API"\n');
console.log('─'.repeat(80));
console.log('');

async function checkProject(project) {
  try {
    // Set the project
    await execAsync(`gcloud config set project ${project.id}`);
    
    // Check if API is enabled
    const { stdout } = await execAsync(
      `gcloud services list --enabled --filter="name:mybusiness.googleapis.com"`
    );
    
    const hasAPI = stdout.includes('mybusiness.googleapis.com');
    
    return {
      name: project.name,
      id: project.id,
      hasAPI,
      status: hasAPI ? '✅ Enabled' : '❌ Not Enabled'
    };
  } catch (error) {
    return {
      name: project.name,
      id: project.id,
      hasAPI: false,
      status: '❓ Unable to check (gcloud not configured or API not accessible)'
    };
  }
}

async function main() {
  console.log('Checking projects...\n');
  
  const results = [];
  
  for (const project of PROJECTS) {
    const result = await checkProject(project);
    results.push(result);
    console.log(`${result.status} - ${result.name} (${result.id})`);
  }
  
  console.log('\n' + '─'.repeat(80));
  console.log('\n📋 Summary:\n');
  
  const enabledProjects = results.filter(r => r.hasAPI);
  
  if (enabledProjects.length > 0) {
    console.log('✅ Projects with Google My Business API enabled:');
    enabledProjects.forEach(p => {
      console.log(`   - ${p.name} (${p.id})`);
    });
    console.log('\n💡 Recommendation: Use one of these projects!');
  } else {
    console.log('❌ No projects found with Google My Business API enabled.');
    console.log('\n💡 Recommendation:');
    console.log('   1. Use "Google my business" project');
    console.log('   2. Enable Google My Business API in that project');
    console.log('   3. Or use "HMNP" project and enable the API there');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Choose a project from above');
  console.log('   2. Ensure Google My Business API is enabled');
  console.log('   3. Create/get OAuth Client ID from that project');
  console.log('   4. Add redirect URI: http://localhost:8080/callback');
  console.log('   5. Update .env.local with Client ID and Secret');
  console.log('   6. Run: node scripts/get-gmb-refresh-token.js');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.log('\n💡 Manual Check Method:');
  console.log('   1. Go to: https://console.cloud.google.com/apis/library');
  console.log('   2. Switch to each project');
  console.log('   3. Search for "Google My Business API"');
  console.log('   4. Look for "API enabled" or "Enable" button');
  process.exit(1);
});

