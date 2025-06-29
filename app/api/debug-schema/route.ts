import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database-connection';

export async function GET(request: NextRequest) {
  try {
    console.log('[SCHEMA DEBUG] Starting schema investigation');
    
    // Get Service table column information
    const serviceColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Service' 
      ORDER BY ordinal_position;
    `;
    
    console.log('[SCHEMA DEBUG] Service columns:', serviceColumns);
    
    // Get BusinessSettings table column information
    const businessSettingsColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'BusinessSettings' 
      ORDER BY ordinal_position;
    `;
    
    console.log('[SCHEMA DEBUG] BusinessSettings columns:', businessSettingsColumns);
    
    // Check if Service table has any data
    const serviceCountResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Service"`;
    const serviceCount = Number((serviceCountResult as any)[0]?.count || 0);
    console.log('[SCHEMA DEBUG] Service count:', serviceCount);
    
    // Try to get first service using only basic columns
    const firstService = await prisma.$queryRaw`
      SELECT id, name 
      FROM "Service" 
      LIMIT 1;
    `;
    
    console.log('[SCHEMA DEBUG] First service:', firstService);
    
    // Get migration status
    const migrationStatus = await prisma.$queryRaw`
      SELECT migration_name, finished_at, logs 
      FROM "_prisma_migrations" 
      ORDER BY finished_at DESC 
      LIMIT 10;
    `;
    
    console.log('[SCHEMA DEBUG] Recent migrations:', migrationStatus);
    
    return NextResponse.json({
      success: true,
      schema: {
        serviceColumns,
        businessSettingsColumns,
        serviceCount,
        firstService,
        migrationStatus,
      },
      message: 'Schema debugging complete'
    });
    
  } catch (error) {
    console.error('[SCHEMA DEBUG] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}