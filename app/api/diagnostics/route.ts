import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    redis: false,
    database: false,
    ghl: false,
    environment: {
      hasRedisUrl: !!process.env.REDIS_URL || !!process.env.UPSTASH_REDIS_REST_URL,
      hasGhlToken: !!process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  };

  // Test Redis
  try {
    if (redis && (await redis.ping()) === 'PONG') {
      diagnostics.redis = true;
    }
  } catch (error) {
    console.error('Redis diagnostic failed:', error);
  }

  // Test database
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.database = true;
  } catch (error) {
    console.error('Database diagnostic failed:', error);
  }

  // Test GHL token by hitting lightweight endpoint
  if (process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
    try {
      const res = await fetch('https://services.leadconnectorhq.com/users/lookup', {
        method: 'GET',
        headers: {
          Authorization: process.env.GHL_PRIVATE_INTEGRATION_TOKEN,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
      });
      diagnostics.ghl = res.ok;
    } catch (error) {
      console.error('GHL diagnostic failed:', error);
    }
  }

  return NextResponse.json(diagnostics);
} 