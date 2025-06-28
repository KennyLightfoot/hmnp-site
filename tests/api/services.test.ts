import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@/lib/prisma';

describe('/api/services', () => {
  beforeAll(async () => {
    // Ensure we have test data
    await prisma.Service.upsert({
      where: { id: 'test-service-1' },
      update: {},
      create: {
        id: 'test-service-1',
        name: 'Test Standard Notary',
        serviceType: 'STANDARD_NOTARY',
        basePrice: 75.00,
        depositAmount: 25.00,
        requiresDeposit: true,
        isActive: true,
        description: 'Test service for API testing',
        durationMinutes: 90,
        updatedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.Service.deleteMany({
      where: { id: 'test-service-1' }
    });
    await prisma.$disconnect();
  });

  it('should return services with correct field names', async () => {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/services`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.services).toBeDefined();
    expect(data.services.all).toBeDefined();
    expect(Array.isArray(data.services.all)).toBe(true);
    
    if (data.services.all.length > 0) {
      const service = data.services.all[0];
      
      // Check that the service has the correct field names
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('duration'); // mapped from durationMinutes
      expect(service).toHaveProperty('price'); // mapped from basePrice
      expect(service).toHaveProperty('requiresDeposit');
      expect(service).toHaveProperty('depositAmount');
      
      // Ensure it doesn't have old field names
      expect(service).not.toHaveProperty('active');
      expect(service).not.toHaveProperty('durationMinutes'); // should be mapped to 'duration'
      expect(service).not.toHaveProperty('basePrice'); // should be mapped to 'price'
    }
  });

  it('should only return active services', async () => {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/services`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    
    // All returned services should be active
    data.services.all.forEach((service: any) => {
      // Services should implicitly be active since the API filters for isActive: true
      expect(service.isActive).toBe(true);
    });
  });

  it('should group services by type', async () => {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/services`);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.services.byType).toBeDefined();
    expect(typeof data.services.byType).toBe('object');
    expect(data.services.typeLabels).toBeDefined();
    expect(typeof data.services.typeLabels).toBe('object');
  });

  it('should handle errors gracefully', async () => {
    // This test would require mocking Prisma to throw an error
    // For now, just ensure the endpoint exists and doesn't crash
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/services`);
    
    // Should either return 200 with data or 500 with error, but not crash
    expect([200, 500]).toContain(response.status);
    
    const data = await response.json();
    if (response.status === 500) {
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    }
  });
});