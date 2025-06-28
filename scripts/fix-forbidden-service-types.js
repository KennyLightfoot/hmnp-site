#!/usr/bin/env node

/**
 * SOP Compliance Service Type Migration Script
 * Systematically replaces forbidden service types with SOP-compliant alternatives
 * 
 * Forbidden Types → SOP Compliant Types:
 * - "standard-notary" → "standard-notary"
 * - "extended-hours-notary" → "extended-hours-notary" 
 * - "standard-notary" → "standard-notary"
 * - "specialty-notary-service" → "specialty-notary-service"
 * - "loan-signing-specialist" → "loan-signing-specialist"
 */

import fs from 'fs';
import path from 'path';

// Service type mappings from forbidden to SOP-compliant
const SERVICE_TYPE_MAPPINGS = {
  "standard-notary": 'standard-notary',
  "extended-hours-notary": 'extended-hours-notary',
  "standard-notary": 'standard-notary', 
  "specialty-notary-service": 'specialty-notary-service',
  "loan-signing-specialist": 'loan-signing-specialist'
};

// Calendar ID mappings for environment variables
const CALENDAR_ID_MAPPINGS = {
  'GHL_STANDARD_NOTARY_CALENDAR_ID': 'GHL_STANDARD_NOTARY_CALENDAR_ID',
  'GHL_EXTENDED_HOURS_CALENDAR_ID': 'GHL_EXTENDED_HOURS_CALENDAR_ID',
  'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID': 'GHL_LOAN_SIGNING_SPECIALIST_CALENDAR_ID'
};

// Route mappings for URL paths
const ROUTE_MAPPINGS = {
  '/services/standard-notary': '/services/standard-notary',
  '/services/extended-hours-notary': '/services/extended-hours-notary',
  '/services/standard-notary': '/services/standard-notary',
  '/services/specialty-notary-service': '/services/specialty-notary-service',
  '/services/loan-signing-specialist': '/services/loan-signing-specialist-specialist'
};

class ServiceTypeMigrator {
  constructor() {
    this.filesProcessed = 0;
    this.totalReplacements = 0;
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
    
    console.log('🚀 Starting SOP Compliance Service Type Migration');
    console.log(`📋 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log('📊 Forbidden → SOP Compliant Mappings:');
    Object.entries(SERVICE_TYPE_MAPPINGS).forEach(([forbidden, compliant]) => {
      console.log(`   "${forbidden}" → "${compliant}"`);
    });
    console.log('');
  }

  /**
   * Main migration function
   */
  async migrate() {
    try {
      // Phase 1: Update file contents
      await this.updateFileContents();
      
      // Phase 2: Rename service page directories  
      await this.renameServiceDirectories();
      
      // Phase 3: Update environment examples
      await this.updateEnvironmentFiles();
      
      // Phase 4: Generate summary report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Update file contents with service type replacements
   */
  async updateFileContents() {
    console.log('📝 Phase 1: Updating file contents...');
    
    // Find all relevant files to process using recursive directory traversal
    const files = this.findFiles('.', [
      '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mjs'
    ], [
      'node_modules', '.next', 'dist', '.git', 'pnpm-lock.yaml'
    ]);

    console.log(`📁 Found ${files.length} files to process`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log(`✅ Phase 1 Complete: ${this.filesProcessed} files processed, ${this.totalReplacements} replacements made\n`);
  }

  /**
   * Recursively find files with specific extensions
   */
  findFiles(dir, extensions, excludeDirs = []) {
    const files = [];
    
    const traverse = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
            traverse(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    traverse(dir);
    return files;
  }

  /**
   * Process individual file for service type replacements
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let fileReplacements = 0;

      // Apply service type replacements
      Object.entries(SERVICE_TYPE_MAPPINGS).forEach(([forbidden, compliant]) => {
        // String literal replacements
        const stringPattern = new RegExp(`["'\`]${forbidden}["'\`]`, 'g');
        const stringMatches = (updatedContent.match(stringPattern) || []).length;
        if (stringMatches > 0) {
          updatedContent = updatedContent.replace(stringPattern, `"${compliant}"`);
          fileReplacements += stringMatches;
        }

        // Object key replacements
        const keyPattern = new RegExp(`(\\w+\\s*:\\s*)["'\`]?${forbidden}["'\`]?([,\\s}])`, 'g');
        const keyMatches = (updatedContent.match(keyPattern) || []).length;
        if (keyMatches > 0) {
          updatedContent = updatedContent.replace(keyPattern, `$1"${compliant}"$2`);
          fileReplacements += keyMatches;
        }

        // URL path replacements
        const urlPattern = new RegExp(`/services/${forbidden}`, 'g');
        const urlMatches = (updatedContent.match(urlPattern) || []).length;
        if (urlMatches > 0) {
          updatedContent = updatedContent.replace(urlPattern, `/services/${compliant}`);
          fileReplacements += urlMatches;
        }

        // CSS class name replacements
        const classPattern = new RegExp(`(class[\\w\\s]*=\\s*["'\`][^"'\`]*\\b)${forbidden}(\\b[^"'\`]*["'\`])`, 'g');
        const classMatches = (updatedContent.match(classPattern) || []).length;
        if (classMatches > 0) {
          updatedContent = updatedContent.replace(classPattern, `$1${compliant}$2`);
          fileReplacements += classMatches;
        }
      });

      // Calendar ID replacements for environment variables
      Object.entries(CALENDAR_ID_MAPPINGS).forEach(([oldKey, newKey]) => {
        const calendarPattern = new RegExp(oldKey, 'g');
        const calendarMatches = (updatedContent.match(calendarPattern) || []).length;
        if (calendarMatches > 0) {
          updatedContent = updatedContent.replace(calendarPattern, newKey);
          fileReplacements += calendarMatches;
        }
      });

      // Write changes if content was modified
      if (updatedContent !== content) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
        }
        
        console.log(`   ✏️  ${filePath} (${fileReplacements} replacements)`);
        this.totalReplacements += fileReplacements;
      }

      this.filesProcessed++;

    } catch (error) {
      console.error(`   ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Rename service page directories
   */
  async renameServiceDirectories() {
    console.log('📂 Phase 2: Renaming service directories...');

    const serviceDirectories = [
      { old: 'app/services/standard-notary', new: 'app/services/standard-notary' },
      { old: 'app/services/extended-hours-notary', new: 'app/services/extended-hours-notary' },
      { old: 'app/services/standard-notary', new: 'app/services/standard-notary-basic' }, // Avoid collision
      { old: 'app/services/specialty-notary-service', new: 'app/services/specialty-notary-service' },
      { old: 'app/services/loan-signing-specialist', new: 'app/services/loan-signing-specialist-specialist' }
    ];

    for (const { old, new: newPath } of serviceDirectories) {
      try {
        if (fs.existsSync(old)) {
          if (!this.dryRun) {
            // Create new directory and copy contents
            fs.mkdirSync(newPath, { recursive: true });
            this.copyDirectory(old, newPath);
            
            // Remove old directory
            fs.rmSync(old, { recursive: true, force: true });
          }
          
          console.log(`   📁 ${old} → ${newPath}`);
        }
      } catch (error) {
        console.error(`   ❌ Error renaming ${old}:`, error.message);
        this.errors.push({ directory: old, error: error.message });
      }
    }

    console.log('✅ Phase 2 Complete: Service directories renamed\n');
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, destination) {
    const items = fs.readdirSync(source);
    
    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  /**
   * Update environment configuration files
   */
  async updateEnvironmentFiles() {
    console.log('🔧 Phase 3: Updating environment files...');

    const envFiles = ['.env.example', '.env.local.example', 'env.example'];
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        await this.processFile(envFile);
        console.log(`   🔧 Updated ${envFile}`);
      }
    }

    console.log('✅ Phase 3 Complete: Environment files updated\n');
  }

  /**
   * Generate migration report
   */
  generateReport() {
    console.log('📊 SOP COMPLIANCE MIGRATION REPORT');
    console.log('=' .repeat(50));
    console.log(`📁 Files Processed: ${this.filesProcessed}`);
    console.log(`🔄 Total Replacements: ${this.totalReplacements}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`✅ Success Rate: ${((this.filesProcessed - this.errors.length) / this.filesProcessed * 100).toFixed(1)}%`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.file || error.directory}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Run tests to verify functionality');
    console.log('   2. Update any remaining manual references');
    console.log('   3. Deploy to staging for verification');
    console.log('   4. Create redirects for old service URLs');
    
    if (this.dryRun) {
      console.log('\n⚠️  DRY RUN COMPLETE - No files were actually modified');
      console.log('   Run without --dry-run to perform actual migration');
    } else {
      console.log('\n✅ MIGRATION COMPLETE - All forbidden service types replaced');
    }
  }
}

// Run migration
const migrator = new ServiceTypeMigrator();
migrator.migrate().catch(console.error);