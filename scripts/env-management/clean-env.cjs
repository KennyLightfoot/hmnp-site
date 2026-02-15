#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('🧹 Cleaning up .env.local file...');

// Split into lines and process each line
const lines = envContent.split('\n');
const cleanedLines = [];

for (const line of lines) {
  // Skip empty lines and comments
  if (!line.trim() || line.startsWith('#')) {
    cleanedLines.push(line);
    continue;
  }

  // Check if line has a variable assignment
  const equalIndex = line.indexOf('=');
  if (equalIndex === -1) {
    cleanedLines.push(line);
    continue;
  }

  const varName = line.substring(0, equalIndex);
  let varValue = line.substring(equalIndex + 1);

  // Remove trailing newline characters from the value
  if (varValue.startsWith('"') && varValue.endsWith('\\n"')) {
    varValue = varValue.slice(0, -3) + '"';
    console.log(`✅ Cleaned: ${varName}`);
  } else if (varValue.includes('\\n')) {
    // Replace any \n within the value (but keep legitimate newlines in JSON)
    varValue = varValue.replace(/\\n(?=")/g, '');
    console.log(`✅ Cleaned: ${varName}`);
  }

  cleanedLines.push(varName + '=' + varValue);
}

// Write the cleaned content back
const cleanedContent = cleanedLines.join('\n');
fs.writeFileSync(envPath, cleanedContent);

console.log('\n🎉 .env.local file cleaned successfully!');
console.log('📝 Summary:');
console.log('- Removed trailing \\n characters from variable values');
console.log('- Preserved legitimate newlines in JSON strings');
console.log('- Maintained proper quoting around values');
console.log('\n💡 The quotes around variables are correct and should be kept!'); 