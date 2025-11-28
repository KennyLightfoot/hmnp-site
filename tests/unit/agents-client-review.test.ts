import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  listReviewJobs,
  getReviewJob,
  approveReviewJob,
  rejectReviewJob,
  type ListReviewJobsResponse,
  type GetReviewJobResponse,
} from '@/lib/agents-client';
import { AGENTS_ADMIN_SECRET } from '@/lib/agents-config';

// Basic fetch mock
const fetchMock = vi.fn();

// @ts-expect-error override global for tests
global.fetch = fetchMock;

describe('lib/agents-client – review helpers', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('listReviewJobs builds correct URL and includes admin secret header', async () => {
    const payload: ListReviewJobsResponse = {
      ok: true,
      count: 0,
      jobs: [],
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => payload,
    });

    const res = await listReviewJobs({
      status: 'PENDING_REVIEW',
      contentType: 'BLOG',
      limit: 25,
    });

    expect(res.ok).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'http://localhost:4001/review/jobs?status=PENDING_REVIEW&contentType=BLOG&limit=25',
    );
    if (AGENTS_ADMIN_SECRET) {
      const headers = init.headers as Record<string, string> | undefined;
      expect(headers?.['x-api-key']).toBeDefined();
    }
  });

  it('approveReviewJob hits correct endpoint with POST and admin header', async () => {
    const payload: GetReviewJobResponse = {
      ok: true,
      job: {
        id: 'job-1',
        type: 'BLOG',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: {},
        result: {},
      },
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => payload,
    });

    const res = await approveReviewJob('job-1');
    expect(res.ok).toBe(true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:4001/review/jobs/job-1/approve');
    expect(init?.method).toBe('POST');
    if (AGENTS_ADMIN_SECRET) {
      const headers = init.headers as Record<string, string> | undefined;
      expect(headers?.['x-api-key']).toBeDefined();
    }
  });

  it('rejectReviewJob sends reviewerNotes in body when provided', async () => {
    const payload: GetReviewJobResponse = {
      ok: true,
      job: {
        id: 'job-2',
        type: 'BLOG',
        status: 'REJECTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: {},
        result: {},
        reviewerNotes: 'Needs work',
      },
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => payload,
    });

    const res = await rejectReviewJob('job-2', 'Needs work');
    expect(res.ok).toBe(true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:4001/review/jobs/job-2/reject');
    expect(init?.method).toBe('POST');
    if (AGENTS_ADMIN_SECRET) {
      const headers = init.headers as Record<string, string> | undefined;
      expect(headers?.['x-api-key']).toBeDefined();
    }
    expect(init?.body).toBe(JSON.stringify({ reviewerNotes: 'Needs work' }));
  });
});


