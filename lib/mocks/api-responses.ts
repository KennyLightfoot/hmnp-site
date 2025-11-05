/**
 * Mock API Responses for UI Preview Mode
 * 
 * Provides realistic mock data for API endpoints when PREVIEW_UI_ONLY=true
 * This allows UI development and testing without backend dependencies
 */

import { DateTime } from 'luxon';

// Mock booking data
export const mockBooking = {
  id: 'mock-booking-123',
  signerId: 'mock-user-123',
  serviceId: 'mock-service-123',
  status: 'CONFIRMED',
  scheduledDateTime: DateTime.now().plus({ days: 2 }).toISO(),
  serviceAddress: '123 Main St, Houston, TX 77001',
  numberOfSigners: 2,
  documentCount: 3,
  totalAmount: 150,
  travelFee: 25,
  createdAt: DateTime.now().minus({ days: 1 }).toISO(),
  updatedAt: DateTime.now().toISO(),
};

// Mock user data
export const mockUser = {
  id: 'mock-user-123',
  email: 'user@example.com',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  phone: '(832) 555-0123',
  role: 'USER',
  createdAt: DateTime.now().minus({ days: 30 }).toISO(),
};

// Mock notary user
export const mockNotary = {
  id: 'mock-notary-123',
  email: 'notary@example.com',
  name: 'Jane Smith',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '(832) 555-0456',
  role: 'NOTARY',
  createdAt: DateTime.now().minus({ days: 90 }).toISO(),
};

// Mock service data
export const mockService = {
  id: 'mock-service-123',
  name: 'Mobile Notary Service',
  slug: 'mobile-notary',
  description: 'Professional mobile notary service',
  type: 'MOBILE_NOTARY',
  basePrice: 125,
  active: true,
};

// Mock assignment data
export const mockAssignment = {
  id: 'mock-assignment-123',
  title: 'Notarization Assignment - Downtown Houston',
  description: 'Notarize loan documents for client',
  status: 'SCHEDULED',
  assigneeId: 'mock-notary-123',
  dueDate: DateTime.now().plus({ days: 1 }).toISO(),
  createdAt: DateTime.now().minus({ hours: 6 }).toISO(),
  updatedAt: DateTime.now().toISO(),
};

// Mock availability slots (already implemented in availability route)
export function generateMockAvailabilitySlots(date: DateTime) {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = date.set({ hour, minute, second: 0, millisecond: 0 });
      const demandLevels = ['low', 'moderate', 'high'] as const;
      
      slots.push({
        startTime: startTime.toISO(),
        endTime: startTime.plus({ minutes: 60 }).toISO(),
        duration: 60,
        demand: demandLevels[Math.floor(Math.random() * 3)],
        available: true,
      });
    }
  }
  
  return slots;
}

// Mock pricing estimate
export function generateMockPricing(params: {
  serviceType?: string;
  numberOfSigners?: number;
  documentCount?: number;
  address?: string;
}) {
  const basePrice = 75;
  const perSignerFee = 25;
  const perDocumentFee = 10;
  const travelFee = 25;
  
  const signerFee = (params.numberOfSigners || 1) * perSignerFee;
  const documentFee = (params.documentCount || 1) * perDocumentFee;
  const total = basePrice + signerFee + documentFee + travelFee;
  
  return {
    basePrice,
    signerFee,
    documentFee,
    travelFee,
    total,
    breakdown: {
      'Base Notary Fee': basePrice,
      'Additional Signers': signerFee,
      'Documents': documentFee,
      'Travel Fee': travelFee,
    },
  };
}

// Mock dashboard stats
export const mockDashboardStats = {
  totalBookings: 47,
  pendingBookings: 5,
  completedBookings: 38,
  cancelledBookings: 4,
  revenue: 7850,
  averageRating: 4.8,
  upcomingAppointments: 3,
};

// Mock blog posts
export const mockBlogPosts = [
  {
    id: 'welcome',
    slug: 'welcome',
    title: 'Welcome to Houston Mobile Notary Pros',
    excerpt: 'Learn about our professional mobile notary services in Houston and surrounding areas.',
    date: '2025-10-27',
    author: 'HMNP Team',
  },
];

// Mock review/testimonial
export const mockReviews = [
  {
    id: 'mock-review-1',
    rating: 5,
    text: 'Excellent service! The notary arrived on time and was very professional.',
    author: 'Sarah Johnson',
    date: DateTime.now().minus({ days: 5 }).toISO(),
  },
  {
    id: 'mock-review-2',
    rating: 5,
    text: 'Quick response and great communication. Highly recommended!',
    author: 'Michael Chen',
    date: DateTime.now().minus({ days: 12 }).toISO(),
  },
  {
    id: 'mock-review-3',
    rating: 4,
    text: 'Good service overall. Made the process easy and convenient.',
    author: 'Emily Rodriguez',
    date: DateTime.now().minus({ days: 20 }).toISO(),
  },
];

export default {
  mockBooking,
  mockUser,
  mockNotary,
  mockService,
  mockAssignment,
  mockDashboardStats,
  mockBlogPosts,
  mockReviews,
  generateMockAvailabilitySlots,
  generateMockPricing,
};


