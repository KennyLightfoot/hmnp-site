export class GHLApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GHLApiError';
  }
}

export class GHLClient {
  private headers: Record<string, string>;

  private static BASE_URL = 'https://services.leadconnectorhq.com';

  constructor() {
    if (!process.env.GHL_PRIVATE_INTEGRATION_TOKEN) {
      throw new Error('GHL_PRIVATE_INTEGRATION_TOKEN is not set');
    }

    this.headers = {
      'Authorization': `Bearer ${process.env.GHL_PRIVATE_INTEGRATION_TOKEN}`,
      'Version': '2021-07-28',
      'Content-Type': 'application/json',
      // Specify the location so calendar/event endpoints authenticate correctly
      'LocationId': process.env.GHL_LOCATION_ID ?? ''
    };
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${GHLClient.BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new GHLApiError(
          'Authentication failed - verify GHL_PRIVATE_INTEGRATION_TOKEN is valid and NOT using Bearer prefix',
          response.status,
          responseData
        );
      }

      if (response.status === 429) {
        throw new GHLApiError(
          'Rate limit exceeded - implement exponential backoff',
          response.status,
          responseData
        );
      }

      throw new GHLApiError(
        responseData?.message || `API request failed: ${response.statusText}`,
        response.status,
        responseData
      );
    }

    return responseData as T;
  }
}

export const ghlClient = process.env.GHL_PRIVATE_INTEGRATION_TOKEN
  ? new GHLClient()
  : (null as unknown as GHLClient); // Allow optional usage in test environments without token 