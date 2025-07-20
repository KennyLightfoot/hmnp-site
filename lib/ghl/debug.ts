export function logGHLRequest(method: string, endpoint: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔵 GHL API Request:', {
      method,
      endpoint,
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data, null, 2) : undefined
    });
  }
}

export function logGHLResponse(endpoint: string, status: number, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(status >= 200 && status < 300 ? '🟢' : '🔴', 'GHL API Response:', {
      endpoint,
      status,
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data, null, 2) : undefined
    });
  }
} 