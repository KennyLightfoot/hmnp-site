import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ContentAdminPage } from '@/components/admin/ContentAdminPage';
import * as agentsClient from '@/lib/agents-client';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: any) => <div>{props.children}</div>,
}));

describe('ContentAdminPage', () => {
  beforeEach(() => {
    vi.spyOn(agentsClient, 'runAgentsJob').mockResolvedValue({
      ok: true,
      correlationId: 'corr-1',
      jobId: 'job-1',
      classification: null,
      routing: null,
      data: null,
      cacheHit: false,
      executionTimeMs: 10,
      error: null,
      meta: null,
    });

    vi.spyOn(agentsClient, 'listReviewJobs').mockResolvedValue({
      ok: true,
      count: 1,
      jobs: [
        {
          id: 'job-1',
          type: 'BLOG',
          status: 'PENDING_REVIEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          payload: { rawText: 'Test' },
          result: {
            title: 'Test Blog',
            slug: 'test-blog',
            summary: 'Summary',
            body: '# Heading',
            metaDescription: 'Meta',
          },
        },
      ],
    });

    vi.spyOn(agentsClient, 'getReviewJob').mockResolvedValue({
      ok: true,
      job: {
        id: 'job-1',
        type: 'BLOG',
        status: 'PENDING_REVIEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: { rawText: 'Test' },
        result: {
          title: 'Test Blog',
          slug: 'test-blog',
          summary: 'Summary',
          body: '# Heading',
          metaDescription: 'Meta',
        },
      },
    });

    vi.spyOn(agentsClient, 'approveReviewJob').mockResolvedValue({
      ok: true,
      job: {
        id: 'job-1',
        type: 'BLOG',
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payload: { rawText: 'Test' },
        result: {
          title: 'Test Blog',
          slug: 'test-blog',
          summary: 'Summary',
          body: '# Heading',
          metaDescription: 'Meta',
        },
      },
    });
  });

  it('renders create form and can submit a job', async () => {
    render(<ContentAdminPage />);

    const textarea = screen.getByLabelText(/What do you want to create/i);
    fireEvent.change(textarea, {
      target: { value: 'Write a blog about mobile notary services' },
    });

    const submit = screen.getByRole('button', { name: /Create content job/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(agentsClient.runAgentsJob).toHaveBeenCalled();
    });
  });

  it('shows review queue and can load a job', async () => {
    render(<ContentAdminPage />);

    const reviewTab = screen.getByRole('tab', { name: /Review Queue/i });
    fireEvent.click(reviewTab);

    await waitFor(() => {
      expect(agentsClient.listReviewJobs).toHaveBeenCalled();
    });

    const jobButton = await screen.findByText('Test Blog');
    fireEvent.click(jobButton);

    await waitFor(() => {
      expect(agentsClient.getReviewJob).toHaveBeenCalledWith('job-1');
    });
  });
});


