import type { PrepSubmission, NewsResult } from '@/types';

/**
 * Builds the prompt for generating search terms based on user input.
 */
export function buildSearchTermPrompt(submission: PrepSubmission): string {
  const { profile, meeting } = submission;

  return `You are a world-class intelligence analyst for an elite corporate advisory and private equity firm.
Your task is to analyze a meeting's parameters and construct highly targeted search queries for the open web.
These queries should seek relevant events from the past 7 to 14 days that are critical for meeting preparation.

Meeting Target (Target Firm / PE Sponsor):
Name: ${meeting.targetFirm}

Meeting Objective:
${meeting.objective}

User Profile (Who is presenting):
Name: ${profile.name}
Title: ${profile.title}
Firm: ${profile.firm}

Historical Context / Interaction History:
${meeting.historicalContext || 'No historical context provided.'}

Your goals:
1. Generate 5-8 focused, precise search queries.
2. Target events in the last 7-14 days.
3. Focus on: sector regulatory shifts, specific portfolio company news, competitor activity, M&A/credit market movements, or personnel changes related to the target firm.
4. Filter out generic terms. Use specific company names, regulatory bills, sector terms, or transaction types.

You must respond ONLY with a JSON object matching this TypeScript structure:
\`\`\`typescript
{
  "terms": [
    { "query": "string (the actual search query)", "focusArea": "string (e.g., Regulatory, Competitor, Deal Activity)" }
  ],
  "dateRange": {
    "from": "string (YYYY-MM-DD)",
    "to": "string (YYYY-MM-DD)"
  },
  "rationale": "string (brief explanation of why these search terms were selected based on the inputs)"
}
\`\`\`

Ensure the response is valid JSON and contains nothing else.`;
}

/**
 * Builds the prompt for synthesizing search results and meeting inputs into the final report.
 */
export function buildSynthesisPrompt(submission: PrepSubmission, newsResults: NewsResult[]): string {
  const { profile, meeting } = submission;

  const newsContext = newsResults.map((r, i) => `
[Result #${i + 1}]
Source: ${r.source}
Date: ${r.date}
Headline: ${r.headline}
Summary: ${r.summary}
Category: ${r.category}
Relevance Score: ${r.relevanceScore}/100
`).join('\n');

  return `You are an elite corporate advisor and senior credit analyst.
Your task is to review meeting parameters, historical interaction notes, and recent web intelligence, then synthesize a stateless, high-impact Just-in-Time Meeting Prep Report.
You must filter out public relations fluff, marketing boilerplate, and generic sector platitudes. Focus strictly on actionable intelligence, credit/deal relevance, and tactical advantages.

User Profile:
Name: ${profile.name}
Title: ${profile.title}
Firm: ${profile.firm}
Email: ${profile.email}

Meeting Target: ${meeting.targetFirm}
Meeting Objective: ${meeting.objective}

Historical Context / Notes:
${meeting.historicalContext || 'No historical context provided.'}

Recent Web & Market Intelligence (Last 7-14 Days):
${newsContext || 'No recent news results retrieved.'}

Structure the final report into these four specific headers:
1. **Executive Summary**: 3-4 paragraphs analyzing the target's current positioning, recent movements, and the core strategic opportunity of the meeting. Keep it dense, professional, and punchy.
2. **Critical Changes (Last 14 Days)**: Bullets detailing concrete market shifts, regulatory updates, portfolio company announcements, or competitors' maneuvers. Avoid fluff.
3. **Competitor / Regulatory Blindspots**: Highly tailored risks or opportunities that the target (or their rivals) might not have fully accounted for, or regulatory transitions they are facing.
4. **Tailored Pitch Angles**: Highly tactical suggestions for the user (${profile.name} from ${profile.firm}) on how to open, position their capabilities, and steer the conversation based on the intelligence.

You must respond ONLY with a JSON object matching this TypeScript structure:
\`\`\`typescript
{
  "executiveSummary": "string (markdown allowed, paragraphs separated by double newlines)",
  "criticalChanges": "string (markdown list format, dense bullet points)",
  "competitorBlindspots": "string (markdown format, detailed analysis of specific risks/opportunities)",
  "tailoredPitchAngles": "string (markdown format, tactical advice and opening questions/talking points)",
  "targetFirm": "string (the target firm name)"
}
\`\`\`

Do not include markdown code block syntax around the JSON inside the response text if possible, but if you do, make sure it is a valid JSON block. Respond only with the JSON object.`;
}
