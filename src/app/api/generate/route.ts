import { NextRequest, NextResponse } from 'next/server';
import type { PrepSubmission } from '@/types';
import { runPrepPipeline } from '@/lib/pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PrepSubmission;

    // Validate body structure and essential fields
    if (!body || !body.profile || !body.meeting) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission payload structure.' },
        { status: 400 }
      );
    }

    const { profile, meeting } = body;

    if (!profile.name || !profile.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required user profile fields (name and email).' },
        { status: 400 }
      );
    }

    if (!meeting.targetFirm || !meeting.objective) {
      return NextResponse.json(
        { success: false, error: 'Missing required meeting details (targetFirm and objective).' },
        { status: 400 }
      );
    }

    // Trigger the agentic data pipeline in the background (fire-and-forget)
    // We explicitly do NOT await this call so the request returns 202 Accepted instantly
    runPrepPipeline(body).catch((error) => {
      console.error('[API API/Generate] Background pipeline execution failed:', error);
    });

    // Instantly respond to client
    return NextResponse.json(
      {
        success: true,
        message: 'Meeting preparation report request accepted. The background pipeline has started and will email the report.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[API API/Generate] Error handling POST request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error processing request.' },
      { status: 500 }
    );
  }
}
