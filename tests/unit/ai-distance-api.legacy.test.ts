import { GET } from '@/app/api/_ai/get-distance/route';
import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Freeze time to avoid past-date issues
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

// Mock distance helper
vi.mock('@/lib/maps/distance', () => ({
  calculateDistanceWithCache: vi.fn()
}));

describe('/api/_ai/get-distance', () => {
  let mockCalc: any;

  beforeEach(async () => {
    const distanceMod = await import('@/lib/maps/distance');
    mockCalc = distanceMod.calculateDistanceWithCache as any;
    vi.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should calculate distance and travel fee for ZIP code', async () => {
      // Mock successful distance calculation
      mockCalc.mockResolvedValue({
        distance: { miles: 15.5 },
        duration: { minutes: 25 },
        travelFee: 0,
        isWithinServiceArea: true,
        cacheHit: false,
        source: 'mock'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77008');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expect.objectContaining({
        success: true,
        miles: 15.5,
        travelFee: 0,
        duration: 25
      }));
      expect(mockCalc).toHaveBeenCalledWith('77008', 'STANDARD_NOTARY');
    });

    it('should calculate travel fee for distance over 20 miles', async () => {
      // Mock distance over 20 miles
      mockCalc.mockResolvedValue({
        distance: { miles: 35.2 },
        duration: { minutes: 45 },
        travelFee: 7.60,
        isWithinServiceArea: true,
        cacheHit: false,
        source: 'mock'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77001');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(expect.objectContaining({
        success: true,
        miles: 35.2,
        travelFee: 7.60,
        duration: 45
      }));
    });

    it('should handle address parameter', async () => {
      mockCalc.mockResolvedValue({
        distance: { miles: 12.3 },
        duration: { minutes: 20 },
        travelFee: 0,
        isWithinServiceArea: true,
        cacheHit: false,
        source: 'mock'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?address=123 Main St, Houston, TX');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.miles).toBe(12.3);
      expect(mockCalc).toHaveBeenCalledWith('123 Main St, Houston, TX', 'STANDARD_NOTARY');
    });

    it('should handle different service types', async () => {
      mockCalc.mockResolvedValue({
        distance: { miles: 18.7 },
        duration: { minutes: 30 },
        travelFee: 0,
        isWithinServiceArea: true,
        cacheHit: false,
        source: 'mock'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77005&serviceType=LOAN_SIGNING');
      const response = await GET(request);

      expect(mockCalc).toHaveBeenCalledWith('77005', 'LOAN_SIGNING');
    });

    it('should return error when no location parameter provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'ZIP code or address is required'
      });
    });

    it('should handle distance calculation failures', async () => {
      mockCalc.mockResolvedValue({
        success: false,
        error: 'Invalid location'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('distance');
    });

    it('should handle service errors gracefully', async () => {
      mockCalc.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77008');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('service unavailable');
    });

    it('should mark locations over 50 miles as outside service area', async () => {
      mockCalc.mockResolvedValue({
        distance: { miles: 65.5 },
        duration: { minutes: 90 },
        travelFee: 22.75,
        isWithinServiceArea: false,
        cacheHit: false,
        source: 'mock'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77001');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.withinServiceArea).toBe(false);
      expect(data.miles).toBe(65.5);
    });
  });
}); 