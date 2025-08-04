import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Test Redis connection
    const pingResult = await redis.ping();
    
    // Test basic operations
    const testKey = 'test_connection_' + Date.now();
    const testValue = 'test_value_' + Date.now();
    
    await redis.set(testKey, testValue, 60); // 60 second TTL
    const retrievedValue = await redis.get(testKey);
    await redis.del(testKey);
    
    return NextResponse.json({
      success: true,
      ping: pingResult,
      setTest: retrievedValue === testValue,
      connectionStatus: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionStatus: 'failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
