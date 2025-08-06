#!/usr/bin/env tsx

/**
 * v0.dev Integration Utility
 * 
 * Helps integrate v0.dev generated components into the local repository
 * Checks dependencies, validates components, and assists with setup
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface V0Component {
  name: string;
  content: string;
  dependencies: string[];
  imports: string[];
}

class V0IntegrationHelper {
  private projectRoot: string;
  private componentsDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.componentsDir = path.join(this.projectRoot, 'components', 'ui');
  }

  /**
   * Check if required dependencies are installed
   */
  checkDependencies(): { missing: string[]; installed: string[] } {
    const requiredDeps = [
      '@radix-ui/react-slot',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'lucide-react'
    ];

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf-8')
    );

    const installed = Object.keys(packageJson.dependencies || {});
    const missing = requiredDeps.filter(dep => !installed.includes(dep));

    return { missing, installed: requiredDeps.filter(dep => installed.includes(dep)) };
  }

  /**
   * Install missing dependencies
   */
  async installDependencies(dependencies: string[]): Promise<void> {
    if (dependencies.length === 0) {
      console.log('✅ All required dependencies are already installed');
      return;
    }

    console.log(`📦 Installing missing dependencies: ${dependencies.join(', ')}`);
    
    try {
      execSync(`pnpm add ${dependencies.join(' ')}`, { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error);
      throw error;
    }
  }

  /**
   * Create component file from v0.dev generated code
   */
  createComponent(componentName: string, content: string): void {
    // Ensure components directory exists
    if (!fs.existsSync(this.componentsDir)) {
      fs.mkdirSync(this.componentsDir, { recursive: true });
    }

    const fileName = `${componentName}.tsx`;
    const filePath = path.join(this.componentsDir, fileName);

    // Check if component already exists
    if (fs.existsSync(filePath)) {
      console.warn(`⚠️ Component ${fileName} already exists. Creating backup...`);
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      console.log(`📋 Backup created: ${backupPath}`);
    }

    // Write component file
    fs.writeFileSync(filePath, content);
    console.log(`✅ Component created: ${filePath}`);
  }

  /**
   * Validate component structure
   */
  validateComponent(content: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for React import
    if (!content.includes('import React') && !content.includes('import * as React')) {
      issues.push('Missing React import');
    }

    // Check for export
    if (!content.includes('export')) {
      issues.push('No export statement found');
    }

    // Check for TypeScript
    if (!content.includes(':') && !content.includes('interface') && !content.includes('type')) {
      issues.push('Component may not be properly typed');
    }

    // Check for Tailwind classes
    if (!content.includes('className=')) {
      issues.push('No Tailwind classes found - component may not be styled');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Update component imports to match project structure
   */
  updateImports(content: string): string {
    // Replace relative imports with project imports
    let updatedContent = content;

    // Update common import patterns
    const importUpdates = [
      { from: '@/components/ui/', to: '@/components/ui/' },
      { from: '@/lib/utils', to: '@/lib/utils' },
      { from: 'lucide-react', to: 'lucide-react' }
    ];

    importUpdates.forEach(({ from, to }) => {
      const regex = new RegExp(`from ['"]${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
      updatedContent = updatedContent.replace(regex, `from '${to}'`);
    });

    return updatedContent;
  }

  /**
   * Generate component usage example
   */
  generateUsageExample(componentName: string): string {
    return `// Usage example for ${componentName}
import { ${componentName} } from '@/components/ui/${componentName}';

export default function ExamplePage() {
  return (
    <div className="p-4">
      <${componentName} />
    </div>
  );
}`;
  }

  /**
   * Run integration workflow
   */
  async integrateComponent(componentName: string, content: string): Promise<void> {
    console.log(`🚀 Starting v0.dev integration for ${componentName}...`);

    // Check dependencies
    const { missing } = this.checkDependencies();
    if (missing.length > 0) {
      await this.installDependencies(missing);
    }

    // Validate component
    const validation = this.validateComponent(content);
    if (!validation.isValid) {
      console.warn('⚠️ Component validation issues:');
      validation.issues.forEach(issue => console.warn(`  - ${issue}`));
    }

    // Update imports
    const updatedContent = this.updateImports(content);

    // Create component
    this.createComponent(componentName, updatedContent);

    // Generate usage example
    const usageExample = this.generateUsageExample(componentName);
    const examplePath = path.join(this.componentsDir, `${componentName}.example.tsx`);
    fs.writeFileSync(examplePath, usageExample);

    console.log(`✅ Integration complete for ${componentName}`);
    console.log(`📝 Usage example created: ${examplePath}`);
    console.log(`🔧 Next steps:`);
    console.log(`   1. Review the component in ${path.join('components/ui', `${componentName}.tsx`)}`);
    console.log(`   2. Test the component locally`);
    console.log(`   3. Commit changes to Git`);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const helper = new V0IntegrationHelper();
  
  const command = process.argv[2];
  const componentName = process.argv[3];
  const content = process.argv[4];

  switch (command) {
    case 'check-deps':
      const { missing, installed } = helper.checkDependencies();
      console.log('Installed:', installed);
      console.log('Missing:', missing);
      break;

    case 'integrate':
      if (!componentName || !content) {
        console.error('Usage: tsx scripts/v0-integration.ts integrate <componentName> <content>');
        process.exit(1);
      }
      helper.integrateComponent(componentName, content);
      break;

    case 'validate':
      if (!content) {
        console.error('Usage: tsx scripts/v0-integration.ts validate <content>');
        process.exit(1);
      }
      const validation = helper.validateComponent(content);
      console.log('Valid:', validation.isValid);
      console.log('Issues:', validation.issues);
      break;

    default:
      console.log(`
v0.dev Integration Helper

Usage:
  tsx scripts/v0-integration.ts check-deps                    # Check dependencies
  tsx scripts/v0-integration.ts validate <content>            # Validate component
  tsx scripts/v0-integration.ts integrate <name> <content>    # Integrate component

Examples:
  tsx scripts/v0-integration.ts check-deps
  tsx scripts/v0-integration.ts integrate Button "$(cat button-component.tsx)"
      `);
  }
}

export default V0IntegrationHelper; 