import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    console.log('Testing Redis connection...');
    
    // Test basic connection
    const pingResult = await redis.ping();
    console.log('Redis ping result:', pingResult);
    
    // Test basic operations
    const testKey = 'test_key_' + Date.now();
    const testValue = 'test_value_' + Date.now();
    
    // Test set
    const setResult = await redis.set(testKey, testValue);
    console.log('Redis set result:', setResult);
    
    // Test get
    const getResult = await redis.get(testKey);
    console.log('Redis get result:', getResult);
    
    // Test setex
    const setexResult = await redis.setex(testKey + '_setex', 60, testValue);
    console.log('Redis setex result:', setexResult);
    
    // Test ttl
    const ttlResult = await redis.ttl(testKey + '_setex');
    console.log('Redis ttl result:', ttlResult);
    
    // Test pipeline
    const pipeline = redis.pipeline();
    if (pipeline) {
      pipeline.setex(testKey + '_pipeline', 60, testValue);
      const pipelineResult = await pipeline.exec();
      console.log('Redis pipeline result:', pipelineResult);
    } else {
      console.log('Redis pipeline is null');
    }
    
    // Test publish
    const publishResult = await redis.publish('test_channel', 'test_message');
    console.log('Redis publish result:', publishResult);
    
    // Test cleanup
    await redis.del(testKey);
    await redis.del(testKey + '_setex');
    await redis.del(testKey + '_pipeline');
    
    return NextResponse.json({
      success: true,
      results: {
        ping: pingResult,
        set: setResult,
        get: getResult,
        setex: setexResult,
        ttl: ttlResult,
        pipeline: pipeline ? 'available' : 'null',
        publish: publishResult
      },
      message: 'All Redis operations completed successfully'
    });
    
  } catch (error: any) {
    console.error('Redis test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      details: {
        redisAvailable: redis.isAvailable(),
        redisClient: !!redis,
        environment: {
          REDIS_URL: !!process.env.REDIS_URL,
          UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
          REDIS_HOST: !!process.env.REDIS_HOST,
          REDIS_PORT: !!process.env.REDIS_PORT,
          REDIS_PASSWORD: !!process.env.REDIS_PASSWORD
        }
      }
    }, { status: 500 });
  }
} 