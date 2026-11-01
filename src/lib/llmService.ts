import { GoogleGenAI } from '@google/genai';
import type { PrepSubmission, SearchTermsResult, NewsResult, PrepReport } from '@/types';
import { buildSearchTermPrompt, buildSynthesisPrompt } from './prompts';

// Initialize the Google Gen AI client.
// Prioritize GOOGLE_API_KEY as requested, fallback to GEMINI_API_KEY
const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    '[LLM Service] Warning: Neither GOOGLE_API_KEY nor GEMINI_API_KEY is set in the environment variables.'
  );
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'PLACEHOLDER' });

/**
 * Extracts and parses JSON from the LLM response text.
 */
function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    // Matches ```json ... ``` or just ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/, '');
  }

  cleaned = cleaned.trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Generates web search terms based on user input.
 */
export async function generateSearchTerms(submission: PrepSubmission): Promise<SearchTermsResult> {
  const prompt = buildSearchTermPrompt(submission);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini API');
    }

    return parseJsonResponse<SearchTermsResult>(text);
  } catch (error) {
    console.error('[LLM Service] Error in generateSearchTerms:', error);

    // Fallback search term if API fails, ensuring the pipeline doesn't crash completely
    const today = new Date().toISOString().split('T')[0];
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      terms: [
        { query: `${submission.meeting.targetFirm} news last 14 days`, focusArea: 'General Target News' },
        { query: `${submission.meeting.targetFirm} portfolio company updates`, focusArea: 'Portfolio Updates' },
        { query: `${submission.meeting.targetFirm} competitor movement`, focusArea: 'Competitors' },
        { query: `${submission.meeting.targetFirm} regulatory compliance`, focusArea: 'Regulatory' }
      ],
      dateRange: {
        from: fourteenDaysAgo,
        to: today
      },
      rationale: 'Fallback search terms generated due to LLM processing error.'
    };
  }
}

/**
 * Synthesizes search results and user inputs into the final structured report.
 */
export async function synthesizeReport(
  submission: PrepSubmission,
  newsResults: NewsResult[]
): Promise<PrepReport> {
  const prompt = buildSynthesisPrompt(submission, newsResults);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini API during synthesis');
    }

    const parsed = parseJsonResponse<Omit<PrepReport, 'generatedAt'>>(text);

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
      targetFirm: submission.meeting.targetFirm,
    };
  } catch (error) {
    console.error('[LLM Service] Error in synthesizeReport:', error);

    // Fallback report structure if API fails
    return {
      executiveSummary: `Fallback Executive Summary: We attempted to prepare a brief for your upcoming meeting with ${submission.meeting.targetFirm} regarding "${submission.meeting.objective}". An issue occurred during LLM synthesis, but the recent search data was successfully collected.\n\nTarget Firm: ${submission.meeting.targetFirm}\nObjective: ${submission.meeting.objective}`,
      criticalChanges: `* Fallback report generated due to LLM synthesis failure.\n* Please check the attached web research query parameters for references.\n* Found ${newsResults.length} raw search news items.`,
      competitorBlindspots: `Could not synthesize customized blindspots. Please review the raw inputs: "${submission.meeting.objective}".`,
      tailoredPitchAngles: `* Focus on introducing your key capabilities in alignment with "${submission.meeting.objective}".\n* Query the client directly on current challenges with ${submission.meeting.targetFirm}.`,
      generatedAt: new Date().toISOString(),
      targetFirm: submission.meeting.targetFirm,
    };
  }
}
