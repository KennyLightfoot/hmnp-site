import { GET } from '@/app/api/_ai/get-availability/route';
import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Freeze time so requested 2025-01-17 is always in the future
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

// Mock the GHL integration
vi.mock('@/lib/ghl/calendar-mapping', () => ({
  getCalendarIdForService: vi.fn()
}));

vi.mock('@/lib/ghl/management', () => ({
  getCalendarSlots: vi.fn()
}));

describe('/api/_ai/get-availability', () => {
  let mockGetCalendarIdForService: any;
  let mockGetCalendarSlots: any;

  beforeEach(async () => {
    const calendarMapping = await import('@/lib/ghl/calendar-mapping');
    const ghlManagement = await import('@/lib/ghl/management');
    
    mockGetCalendarIdForService = calendarMapping.getCalendarIdForService;
    mockGetCalendarSlots = ghlManagement.getCalendarSlots;
    
    vi.clearAllMocks();
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
      expect(data).toEqual(expect.objectContaining({
        success: true,
        available: true,
        requestedDateTime: requestedTime
      }));
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
      expect(data).toEqual(expect.objectContaining({
        success: true,
        available: false,
        nextSlot: expect.any(Object)
      }));
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
      expect(data.error).toContain('datetime parameter is required');
    });

    it('should return error when datetime format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/_ai/get-availability?datetime=invalid-date');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid datetime format');
    });

    it('should handle calendar service errors gracefully', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue('calendar-123');
      mockGetCalendarSlots.mockRejectedValue(new Error('GHL API unavailable'));

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
    });

    it('should handle missing calendar ID', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockGetCalendarIdForService.mockReturnValue(null);

      const request = new NextRequest(`http://localhost:3000/api/_ai/get-availability?datetime=${requestedTime}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Unsupported service type');
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
      expect(data.nextSlot).toBe(null);
    });
  });
}); 