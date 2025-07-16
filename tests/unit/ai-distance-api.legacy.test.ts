import { GET } from '@/app/api/_ai/get-distance/route';
import { NextRequest } from 'next/server';

// Mock the UnifiedDistanceService
jest.mock('@/lib/maps/unified-distance-service', () => ({
  UnifiedDistanceService: jest.fn().mockImplementation(() => ({
    calculateDistance: jest.fn(),
    getTravelFee: jest.fn()
  }))
}));

describe('/api/_ai/get-distance', () => {
  let mockUnifiedDistanceService: any;

  beforeEach(() => {
    const { UnifiedDistanceService } = require('@/lib/maps/unified-distance-service');
    mockUnifiedDistanceService = new UnifiedDistanceService();
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should calculate distance and travel fee for ZIP code', async () => {
      // Mock successful distance calculation
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        distance: 15.5,
        duration: 25,
        success: true
      });
      mockUnifiedDistanceService.getTravelFee.mockReturnValue(0); // Within 20 miles

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77008');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        miles: 15.5,
        travelFee: 0,
        duration: 25,
        withinServiceArea: true
      });
      expect(mockUnifiedDistanceService.calculateDistance).toHaveBeenCalledWith('77008', 'STANDARD_NOTARY');
    });

    it('should calculate travel fee for distance over 20 miles', async () => {
      // Mock distance over 20 miles
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        distance: 35.2,
        duration: 45,
        success: true
      });
      mockUnifiedDistanceService.getTravelFee.mockReturnValue(7.60); // (35.2 - 20) * 0.50

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77001');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        miles: 35.2,
        travelFee: 7.60,
        duration: 45,
        withinServiceArea: true
      });
    });

    it('should handle address parameter', async () => {
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        distance: 12.3,
        duration: 20,
        success: true
      });
      mockUnifiedDistanceService.getTravelFee.mockReturnValue(0);

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?address=123 Main St, Houston, TX');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.miles).toBe(12.3);
      expect(mockUnifiedDistanceService.calculateDistance).toHaveBeenCalledWith('123 Main St, Houston, TX', 'STANDARD_NOTARY');
    });

    it('should handle different service types', async () => {
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        distance: 18.7,
        duration: 30,
        success: true
      });
      mockUnifiedDistanceService.getTravelFee.mockReturnValue(0);

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77005&serviceType=LOAN_SIGNING');
      const response = await GET(request);

      expect(mockUnifiedDistanceService.calculateDistance).toHaveBeenCalledWith('77005', 'LOAN_SIGNING');
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
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        success: false,
        error: 'Invalid location'
      });

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Could not calculate distance: Invalid location'
      });
    });

    it('should handle service errors gracefully', async () => {
      mockUnifiedDistanceService.calculateDistance.mockRejectedValue(new Error('Service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77008');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Distance calculation service unavailable'
      });
    });

    it('should mark locations over 50 miles as outside service area', async () => {
      mockUnifiedDistanceService.calculateDistance.mockResolvedValue({
        distance: 65.5,
        duration: 90,
        success: true
      });
      mockUnifiedDistanceService.getTravelFee.mockReturnValue(22.75); // (65.5 - 20) * 0.50

      const request = new NextRequest('http://localhost:3000/api/_ai/get-distance?zip=77001');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.withinServiceArea).toBe(false);
      expect(data.miles).toBe(65.5);
      expect(data.travelFee).toBe(22.75);
    });
  });
}); 