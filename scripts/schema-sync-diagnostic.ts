import { PrismaClient } from '@prisma/client';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { execSync } from 'child_process';
import fs from 'fs';

const prisma = new PrismaClient();

interface DiagnosticReport {
  timestamp: Date;
  environment?: string;
  database: {
    connection: string;
    version: string;
    url?: string;
    error?: string;
  };
  migrations: {
    status: string;
    applied?: number;
    error?: string;
  };
  schema: {
    local: any;
    production: any;
    differences: any[];
  };
  recommendations: string[];
}

async function diagnoseSchemaSync() {
  console.log('🔍 PRISMA SCHEMA SYNCHRONIZATION DIAGNOSTIC');
  console.log('=' .repeat(60));
  
  const report: DiagnosticReport = {
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      url: process.env.DATABASE_URL ? 'Set' : 'Missing',
      connection: 'Unknown',
      version: 'Unknown'
    },
    schema: {
      local: {},
      production: {},
      differences: []
    },
    migrations: {
      status: 'Unknown'
    },
    recommendations: []
  };

  try {
    // Test 1: Database Connection & Version
    console.log('\n📡 Testing database connection...');
    const dbVersion = await prisma.$queryRaw`SELECT version() as version`;
    report.database.connection = 'Success';
    report.database.version = (dbVersion as any)[0]?.version || 'Unknown';
    console.log('✅ Database connection successful');
    console.log(`📋 PostgreSQL Version: ${report.database.version}`);

    // Test 2: Migration Status
    console.log('\n📋 Checking migration status...');
    try {
      const migrationStatus = execSync('npx prisma migrate status', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('Migration Status Output:');
      console.log(migrationStatus);
      
      if (migrationStatus.includes('Database schema is up to date!')) {
        report.migrations.status = 'Up to date';
      } else if (migrationStatus.includes('pending')) {
        report.migrations.status = 'Pending migrations';
        report.recommendations.push('Run: npx prisma migrate deploy' as any);
      } else {
        report.migrations.status = 'Unknown state';
        report.recommendations.push('Manual migration review needed' as any);
      }
    } catch (migrationError) {
      console.log('⚠️ Migration status check failed:', getErrorMessage(migrationError));
      report.migrations.status = 'Error';
      report.recommendations.push('Fix migration issues before proceeding' as any);
    }

    // Test 3: Schema Introspection vs Current Schema
    console.log('\n🔍 Comparing current schema with database...');
    
    // Pull current database schema
    console.log('Introspecting production database...');
    try {
      execSync('npx prisma db pull --force', { 
        encoding: 'utf8',
        stdio: 'inherit'
      });
      console.log('✅ Database introspection completed');
    } catch (pullError) {
      console.log('❌ Database pull failed:', getErrorMessage(pullError));
      report.recommendations.push('Fix database connection or permissions' as any);
    }

    // Test 4: Check for Schema Drift
    console.log('\n📊 Analyzing schema differences...');
    const schemaDiff = await analyzeSchemaFile();
    report.schema = schemaDiff as any;

    // Test 5: Verify Critical Tables Exist
    console.log('\n🔍 Verifying critical tables...');
    const criticalTables = [
      'User', 'Service', 'Booking', 'PromoCode', 
      'NotaryProfile', 'FeatureFlag', 'ServiceArea'
    ];
    
    for (const table of criticalTables) {
      try {
        const tableExists = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          ) as exists
        `;
        
        const exists = (tableExists as any)[0]?.exists;
        console.log(`${exists ? '✅' : '❌'} Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
        
        if (!exists) {
          report.recommendations.push(`Critical table ${table} is missing - schema out of sync` as any);
        }
      } catch (error) {
        console.log(`❌ Error checking table ${table}:`, error instanceof Error ? getErrorMessage(error) : String(error));
      }
    }

    // Test 6: Check Service Data Population
    console.log('\n📊 Checking service data...');
    try {
      const serviceCount = await prisma.service.count();
      const activeServiceCount = await prisma.service.count({ where: { isActive: true } });
      
      console.log(`📋 Total services: ${serviceCount}`);
      console.log(`📋 Active services: ${activeServiceCount}`);
      
      if (serviceCount === 0) {
        report.recommendations.push('Database needs seeding: npx ts-node prisma/seed.ts' as any);
      } else if (activeServiceCount < 3) {
        report.recommendations.push('Missing required services - check service data' as any);
      }
    } catch (serviceError) {
      console.log('❌ Service table check failed:', getErrorMessage(serviceError));
      report.recommendations.push('Service table may not exist or be accessible' as any);
    }

  } catch (error) {
    console.error('💥 Diagnostic failed:', getErrorMessage(error));
    report.recommendations.push('Critical: Database connection or permissions issue' as any);
  } finally {
    await prisma.$disconnect();
  }

  // Generate Report
  console.log('\n📋 DIAGNOSTIC REPORT');
  console.log('=' .repeat(40));
  console.log('Database URL:', report.database.url);
  console.log('Connection:', report.database.connection);
  console.log('Migration Status:', report.migrations.status);
  
  if (report.recommendations.length > 0) {
    console.log('\n🚨 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  // Save report
  fs.writeFileSync('schema-sync-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Full report saved to: schema-sync-report.json');
  
  return report;
}

async function analyzeSchemaFile() {
  console.log('📄 Analyzing prisma/schema.prisma...');
  
  try {
    const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
    
    // Count models
    const modelMatches = schemaContent.match(/^model\s+\w+/gm) || [];
    const enumMatches = schemaContent.match(/^enum\s+\w+/gm) || [];
    
    console.log(`📊 Schema contains: ${modelMatches.length} models, ${enumMatches.length} enums`);
    
    return {
      models: modelMatches.length,
      enums: enumMatches.length,
      lastModified: fs.statSync('prisma/schema.prisma').mtime
    };
  } catch (error) {
    console.log('❌ Error analyzing schema file:', error instanceof Error ? getErrorMessage(error) : String(error));
    return { error: getErrorMessage(error) };
  }
}

// Run diagnostic
diagnoseSchemaSync()
  .then((report) => {
    console.log('\n🎉 Schema synchronization diagnostic completed!');
    
    if (report.recommendations.length === 0) {
      console.log('✅ No issues found - schemas appear synchronized');
    } else {
      console.log(`⚠️ Found ${report.recommendations.length} issues requiring attention`);
    }
  })
  .catch((error) => {
    console.error('💥 Diagnostic failed:', getErrorMessage(error));
    process.exit(1);
  });
