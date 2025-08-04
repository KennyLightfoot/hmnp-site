import { clsx, type ClassValue } from "clsx"
import { getErrorMessage } from '@/lib/utils/error-utils';
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBookingReference(): string {
  const prefix = 'HMN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateServiceEndTime(startTime: Date, duration: number): Date {
  return new Date(startTime.getTime() + duration * 60 * 1000);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getTimeUntilAppointment(appointmentDate: Date): {
  hours: number;
  days: number;
  isOverdue: boolean;
} {
  const now = new Date();
  const diffMs = appointmentDate.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  return {
    hours: Math.abs(hours),
    days: Math.abs(days),
    isOverdue: diffMs < 0
  };
}

interface SafeFormSubmitOptions {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timeout?: number;
  headers?: Record<string, string>;
}

interface SafeFormSubmitResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}

export async function safeFormSubmit<T = any>(
  url: string, 
  data: Record<string, any>, 
  options: SafeFormSubmitOptions = {}
): Promise<SafeFormSubmitResponse<T>> {
  const { method = 'POST', timeout = 10000, headers = {} } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Try to get error details from response
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      return {
        success: false,
        message: errorMessage,
        status: response.status
      };
    }

    // Handle different response types
    const contentType = response.headers.get('content-type');
    let result: T;
    
    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      result = (text ? { message: text } : {}) as T;
    }

    return {
      success: true,
      data: result,
      status: response.status
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    let errorMessage = 'Network error occurred';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = `Request timeout after ${timeout}ms`;
      } else {
        errorMessage = getErrorMessage(error);
      }
    }
    
    console.error('Form submission error:', getErrorMessage(error));
    return {
      success: false,
      message: errorMessage
    };
  }
}
