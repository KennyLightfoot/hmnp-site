import { GET } from '@/app/api/_ai/get-availability/route';
import { NextRequest } from 'next/server';

// Mock the GHL integration
jest.mock('@/lib/ghl/calendar-mapping', () => ({
  getCalendarIdForService: jest.fn()
}));

jest.mock('@/lib/ghl/management', () => ({
  getCalendarSlots: jest.fn()
}));

describe('/api/_ai/get-availability', () => {
  let mockGetCalendarIdForService: any;
  let mockGetCalendarSlots: any;

  beforeEach(() => {
    const calendarMapping = require('@/lib/ghl/calendar-mapping');
    const ghlManagement = require('@/lib/ghl/management');
    
    mockGetCalendarIdForService = calendarMapping.getCalendarIdForService;
    mockGetCalendarSlots = ghlManagement.getCalendarSlots;
    
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should return available=true when slot exists for requested time', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      const requestedTimestamp = Math.floor(new Date(requestedTime).getTime() / 1000);
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockResolvedValue([
        {
          startTime: requestedTimestamp,
          endTime: requestedTimestamp + 3600, // 1 hour later
          available: true
        },
        {
          startTime: requestedTimestamp + 7200, // 2 hours later
          endTime: requestedTimestamp + 10800, // 3 hours later
          available: true
        }
      ]);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        available: true,
        requestedTime: requestedTime,
        nextAvailableSlot: null
      });
    });

    it('should return available=false with next available slot when requested time is not available', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      const requestedTimestamp = Math.floor(new Date(requestedTime).getTime() / 1000);
      const nextSlotTime = requestedTimestamp + 3600; // 1 hour later
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockResolvedValue([
        {
          startTime: nextSlotTime,
          endTime: nextSlotTime + 3600,
          available: true
        }
      ]);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        available: false,
        requestedTime: requestedTime,
        nextAvailableSlot: new Date(nextSlotTime * 1000).toISOString()
      });
    });

    it('should handle different service types', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue('loan-calendar-456');
      mockGetCalendarSlots.mockResolvedValue([]);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}&serviceType=LOAN_SIGNING`);
      const response = await GET(request);

      expect(mockGetCalendarIdForService).toHaveBeenCalledWith('LOAN_SIGNING');
      expect(mockGetCalendarSlots).toHaveBeenCalledWith('loan-calendar-456', expect.any(String), expect.any(String));
    });

    it('should return error when datetime parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/_ai/get-availability');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'datetime parameter is required (ISO format)'
      });
    });

    it('should return error when datetime format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/_ai/get-availability?datetime=invalid-date');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Invalid datetime format. Use ISO format (e.g., 2025-01-17T15:00:00.000Z)'
      });
    });

    it('should handle calendar service errors gracefully', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockRejectedValue(new Error('GHL API unavailable'));

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Calendar service unavailable'
      });
    });

    it('should handle missing calendar ID', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue(null);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Calendar not found for service type: STANDARD_NOTARY'
      });
    });

    it('should handle slots with different time formats', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      const requestedTimestamp = Math.floor(new Date(requestedTime).getTime() / 1000);
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockResolvedValue([
        {
          start: requestedTimestamp, // Different field name
          end: requestedTimestamp + 3600,
          available: true
        }
      ]);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    it('should handle past datetime requests', async () => {
      const pastTime = '2023-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockResolvedValue([]);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${pastTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.nextAvailableSlot).toBe(null);
    });
  });
}); 