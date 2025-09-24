import { NextRequest } from 'next/server';
import { getCSRFToken } from '@/lib/security/csrf';

export async function GET(request: NextRequest) {
  return getCSRFToken(request);
}