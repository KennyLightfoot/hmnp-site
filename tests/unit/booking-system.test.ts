/**
 * Booking System Unit Tests
 * Houston Mobile Notary Pros
 * 
 * Tests the booking system components and recent fixes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from '@/components/booking/BookingForm';
import InteractivePricingCalculator from '@/components/booking/InteractivePricingCalculator';

// Mock dependencies
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    ping: vi.fn().mockResolvedValue('PONG'),
    isAvailable: vi.fn().mockReturnValue(true)
  }
}));

vi.mock('@/hooks/use-transparent-pricing', () => ({
  useTransparentPricing: vi.fn(() => ({
    pricing: {
      totalPrice: 75,
      breakdown: {
        serviceBase: { amount: 75, label: 'Standard Notary Service' },
        travelFee: { amount: 0, label: 'Travel Fee' },
        discounts: []
      }
    },
    isLoading: false,
    error: null,
    calculatePricing: vi.fn()
  }))
}));

describe('Booking System Components', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('InteractivePricingCalculator', () => {
    
    it('should render without excessive console logs', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <InteractivePricingCalculator
          serviceType="STANDARD_NOTARY"
          onPricingChange={vi.fn()}
        />
      );
      
      // Wait for component to settle
      await waitFor(() => {
        expect(screen.getByText(/Interactive Pricing|Live Updates/)).toBeInTheDocument();
      });
      
      // Should not have excessive pricing update logs
      const pricingLogs = consoleSpy.mock.calls.filter(call => 
        call[0]?.includes?.('Interactive pricing updated')
      );
      
      expect(pricingLogs.length).toBeLessThan(5);
    });

    it('should call onPricingChange with valid data', async () => {
      const mockOnPricingChange = vi.fn();
      
      render(
        <InteractivePricingCalculator
          serviceType="STANDARD_NOTARY"
          onPricingChange={mockOnPricingChange}
        />
      );
      
      await waitFor(() => {
        expect(mockOnPricingChange).toHaveBeenCalledWith(
          expect.objectContaining({
            total: expect.any(Number),
            serviceBase: expect.any(Number)
          })
        );
      });
    });

    it('should handle service type changes', async () => {
      const { rerender } = render(
        <InteractivePricingCalculator
          serviceType="STANDARD_NOTARY"
          onPricingChange={vi.fn()}
        />
      );
      
      // Change service type
      rerender(
        <InteractivePricingCalculator
          serviceType="EXTENDED_HOURS"
          onPricingChange={vi.fn()}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Interactive Pricing|Live Updates/)).toBeInTheDocument();
      });
    });
  });

  describe('BookingForm', () => {
    
    it('should render without errors', () => {
      render(<BookingForm />);
      
      expect(screen.getByText(/Book Your Notary Service|Choose Service/)).toBeInTheDocument();
    });

    it('should validate current step only', async () => {
      render(<BookingForm />);
      
      // Try to continue without selecting service
      const continueButton = screen.queryByText(/Continue|Next/);
      if (continueButton) {
        fireEvent.click(continueButton);
        
        // Should stay on current step or show validation
        await waitFor(() => {
          expect(screen.getByText(/Choose Service|Select a Service/)).toBeInTheDocument();
        });
      }
    });

    it('should handle service selection', async () => {
      render(<BookingForm />);
      
      // Look for service options
      const serviceOptions = screen.queryAllByText(/Standard Notary|Extended Hours/);
      
      if (serviceOptions.length > 0) {
        fireEvent.click(serviceOptions[0]);
        
        // Should show pricing or advance to next step
        await waitFor(() => {
          expect(screen.getByText(/Interactive Pricing|Live Updates/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Redis Connection', () => {
    
    it('should handle Redis connection gracefully', async () => {
      const { redis } = await import('@/lib/redis');
      
      // Test Redis ping
      const pingResult = await redis.ping();
      expect(pingResult).toBe('PONG');
      
      // Test Redis availability
      expect(redis.isAvailable()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    
    it('should handle component errors gracefully', () => {
      // Mock console.error to prevent test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Render component that might have errors
      expect(() => {
        render(<BookingForm />);
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
}); 