import { POST } from '@/app/api/ai/chat/route';
import { NextRequest } from 'next/server';

// Mock the Vertex AI service
jest.mock('@/lib/vertex', () => ({
  sendChat: jest.fn()
}));

// Mock the internal AI APIs
jest.mock('@/app/api/_ai/get-distance/route', () => ({
  GET: jest.fn()
}));

jest.mock('@/app/api/_ai/get-availability/route', () => ({
  GET: jest.fn()
}));

describe('AI Function Calling Integration', () => {
  let mockSendChat: any;
  let mockDistanceAPI: any;
  let mockAvailabilityAPI: any;

  beforeEach(() => {
    const vertex = require('@/lib/vertex');
    const distanceRoute = require('@/app/api/_ai/get-distance/route');
    const availabilityRoute = require('@/app/api/_ai/get-availability/route');
    
    mockSendChat = vertex.sendChat;
    mockDistanceAPI = distanceRoute.GET;
    mockAvailabilityAPI = availabilityRoute.GET;
    
    jest.clearAllMocks();
  });

  describe('Distance Function Calling', () => {
    it('should call distance API when user asks about travel fees', async () => {
      // Mock Vertex AI to return function call
      mockSendChat.mockResolvedValue({
        text: 'I can help you with that! Let me calculate the distance and travel fee for your location.',
        functionCalls: [
          {
            name: 'get_distance',
            args: { zip: '77008' }
          }
        ]
      });

      // Mock distance API response
      mockDistanceAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          miles: 15.5,
          travelFee: 0,
          withinServiceArea: true
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How much would it cost to come to 77008?',
          locationContext: { zipCode: '77008' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockSendChat).toHaveBeenCalled();
      expect(data.response).toContain('travel fee');
    });

    it('should handle distance API errors gracefully', async () => {
      mockSendChat.mockResolvedValue({
        text: 'Let me check the distance for you.',
        functionCalls: [
          {
            name: 'get_distance',
            args: { zip: 'invalid' }
          }
        ]
      });

      mockDistanceAPI.mockResolvedValue({
        json: async () => ({
          success: false,
          error: 'Invalid ZIP code'
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How far is invalid ZIP?',
          locationContext: { zipCode: 'invalid' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toContain('unable to calculate');
    });
  });

  describe('Availability Function Calling', () => {
    it('should call availability API when user asks about scheduling', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockSendChat.mockResolvedValue({
        text: 'Let me check availability for that time.',
        functionCalls: [
          {
            name: 'get_availability',
            args: { 
              datetime: requestedTime,
              serviceType: 'STANDARD_NOTARY'
            }
          }
        ]
      });

      mockAvailabilityAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          available: true,
          requestedTime: requestedTime,
          nextAvailableSlot: null
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Are you available tomorrow at 3pm?',
          locationContext: { 
            zipCode: '77008',
            preferredDateTime: requestedTime
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockSendChat).toHaveBeenCalled();
      expect(data.response).toContain('available');
    });

    it('should suggest alternative times when requested slot is unavailable', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      const nextSlotTime = '2025-01-17T16:00:00.000Z';
      
      mockSendChat.mockResolvedValue({
        text: 'Let me check that time for you.',
        functionCalls: [
          {
            name: 'get_availability',
            args: { 
              datetime: requestedTime,
              serviceType: 'STANDARD_NOTARY'
            }
          }
        ]
      });

      mockAvailabilityAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          available: false,
          requestedTime: requestedTime,
          nextAvailableSlot: nextSlotTime
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Can you come at 3pm tomorrow?',
          locationContext: { 
            zipCode: '77008',
            preferredDateTime: requestedTime
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toContain('not available');
      expect(data.response).toContain('4:00 PM');
    });
  });

  describe('Multiple Function Calls', () => {
    it('should handle both distance and availability function calls in sequence', async () => {
      const requestedTime = '2025-01-17T15:00:00.000Z';
      
      mockSendChat.mockResolvedValue({
        text: 'I can help you with scheduling and pricing.',
        functionCalls: [
          {
            name: 'get_distance',
            args: { zip: '77008' }
          },
          {
            name: 'get_availability',
            args: { 
              datetime: requestedTime,
              serviceType: 'STANDARD_NOTARY'
            }
          }
        ]
      });

      mockDistanceAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          miles: 15.5,
          travelFee: 0,
          withinServiceArea: true
        })
      });

      mockAvailabilityAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          available: true,
          requestedTime: requestedTime,
          nextAvailableSlot: null
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Can you come to 77008 tomorrow at 3pm and how much will it cost?',
          locationContext: { 
            zipCode: '77008',
            preferredDateTime: requestedTime
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockDistanceAPI).toHaveBeenCalled();
      expect(mockAvailabilityAPI).toHaveBeenCalled();
      expect(data.response).toContain('available');
      expect(data.response).toContain('travel');
    });
  });

  describe('Error Handling', () => {
    it('should handle Vertex AI service errors', async () => {
      mockSendChat.mockRejectedValue(new Error('Vertex AI unavailable'));

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How much for a notary?'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('AI service');
    });

    it('should handle invalid function call responses', async () => {
      mockSendChat.mockResolvedValue({
        text: 'Invalid function call',
        functionCalls: [
          {
            name: 'invalid_function',
            args: {}
          }
        ]
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toContain('unable to process');
    });

    it('should handle missing required parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Message is required');
    });
  });

  describe('Context Handling', () => {
    it('should pass location context to function calls', async () => {
      mockSendChat.mockResolvedValue({
        text: 'Let me check that for you.',
        functionCalls: [
          {
            name: 'get_distance',
            args: { zip: '77008' }
          }
        ]
      });

      mockDistanceAPI.mockResolvedValue({
        json: async () => ({
          success: true,
          miles: 15.5,
          travelFee: 0,
          withinServiceArea: true
        })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How much to come here?',
          locationContext: { 
            zipCode: '77008',
            address: '123 Main St, Houston, TX 77008'
          }
        })
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(mockSendChat).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          locationContext: expect.objectContaining({
            zipCode: '77008',
            address: '123 Main St, Houston, TX 77008'
          })
        })
      );
    });
  });
}); 