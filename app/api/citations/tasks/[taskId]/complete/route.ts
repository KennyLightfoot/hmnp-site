import { NextRequest, NextResponse } from 'next/server';
import { citationTracker } from '@/lib/citations/citation-tracker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get request body for optional notes
    const body = await request.json().catch(() => ({}));
    const { notes, status } = body;

    // Complete the task
    const success = citationTracker.completeTask(taskId, notes);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Task not found or already completed' },
        { status: 404 }
      );
    }

    // If this is a directory submission task, update directory status
    if (status && status === 'APPROVED') {
      // This would typically involve updating the citation manager
      console.log(`✅ Task ${taskId} completed with status: ${status}`);
    }

    console.log(`✅ Maintenance task ${taskId} completed successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      taskId,
      completedAt: new Date().toISOString(),
      notes: notes || null
    });
  } catch (error) {
    console.error('❌ Error completing task:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to complete task',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 