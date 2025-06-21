export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, options);
      
      // Handle different response types
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else {
        data = await response.text().catch(() => '');
      }

      if (!response.ok) {
        // If this is a client error (4xx), don't retry
        if (response.status >= 400 && response.status < 500 && attempt <= this.retries) {
          return {
            success: false,
            error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
            data
          };
        }
        
        // For server errors (5xx), retry
        if (response.status >= 500 && attempt <= this.retries) {
          await this.delay(this.retryDelay * attempt);
          return this.executeWithRetry(url, options, attempt + 1);
        }

        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
          data
        };
      }

      return {
        success: true,
        data,
        message: data.message
      };

    } catch (error) {
      // Network errors, timeouts, etc. - retry if attempts remaining
      if (attempt <= this.retries) {
        await this.delay(this.retryDelay * attempt);
        return this.executeWithRetry(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.executeWithRetry<T>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }

  async post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.executeWithRetry<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.executeWithRetry<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.executeWithRetry<T>(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  }
}

// Default instance for internal API calls
export const apiClient = new ApiClient({
  baseUrl: typeof window !== 'undefined' ? '' : process.env.NEXTAUTH_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Helper functions for common patterns
export async function safeApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  fallbackData?: T
): Promise<{ data: T | undefined; error: string | null }> {
  try {
    const response = await apiCall();
    if (response.success) {
      return { data: response.data, error: null };
    }
    return { data: fallbackData, error: response.error || 'Unknown error' };
  } catch (error) {
    return {
      data: fallbackData,
      error: error instanceof Error ? error.message : 'Unexpected error'
    };
  }
} 