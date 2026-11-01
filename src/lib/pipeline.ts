import type { PrepSubmission } from '@/types';
import { generateSearchTerms, synthesizeReport } from './llmService';
import { searchNews } from './newsService';
import { renderEmailHtml } from './emailTemplate';
import { sendEmail } from './emailService';

/**
 * Orchestrates the multi-stage asynchronous agentic pipeline:
 * 1. Generates focused web search queries from user inputs.
 * 2. Fetches matching market and regulatory news (stubbed).
 * 3. Synthesizes findings using a corporate advisor persona.
 * 4. Generates a custom HTML responsive email.
 * 5. Sends the report to the user's email.
 */
export async function runPrepPipeline(submission: PrepSubmission): Promise<void> {
  const target = submission.meeting.targetFirm;
  console.log(`[Pipeline] >>> Starting Meeting Prep Pipeline for Target: "${target}"`);

  try {
    // Step 1: Generate search queries
    console.log('[Pipeline] Step 1: Generating targeted search queries...');
    const searchTerms = await generateSearchTerms(submission);
    console.log(`[Pipeline] Rationale: "${searchTerms.rationale}"`);
    console.log(`[Pipeline] Generated ${searchTerms.terms.length} search queries.`);
    searchTerms.terms.forEach((t, i) => {
      console.log(`   #${i + 1} [${t.focusArea}]: "${t.query}"`);
    });

    // Step 2: Query search database/API
    console.log('[Pipeline] Step 2: Fetching news and market intelligence...');
    const newsResults = await searchNews(searchTerms);
    console.log(`[Pipeline] Retrieved ${newsResults.length} relevant intelligence stories.`);

    // Step 3: Synthesize news and inputs into advisor report
    console.log('[Pipeline] Step 3: Synthesizing intelligence and drafting advisor report...');
    const report = await synthesizeReport(submission, newsResults);
    console.log(`[Pipeline] Report successfully drafted for ${report.targetFirm}.`);

    // Step 4: Render HTML email body
    console.log('[Pipeline] Step 4: Rendering HTML email formatting...');
    const htmlBody = renderEmailHtml(report, submission.profile);

    // Step 5: Deliver email
    console.log('[Pipeline] Step 5: Dispatching email...');
    const subject = `Meeting Prep Briefing: ${target}`;
    await sendEmail(submission.profile.email, subject, htmlBody);

    console.log(`[Pipeline] <<< Pipeline successfully finished for Target: "${target}"`);
  } catch (error) {
    console.error(`[Pipeline] !!! Severe pipeline crash for Target: "${target}":`, error);
  }
}
