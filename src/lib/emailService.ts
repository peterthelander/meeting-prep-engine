import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Stubbed mailer implementation.
 * Logs the action to the console and writes the HTML email to the local disk
 * under the /emails directory for instant rendering preview.
 *
 * SWAP POINT FOR RESEND/SENDGRID INTEGRATION:
 * Replace this function's body with the respective SDK client calls:
 *
 * Example (Resend):
 *   import { Resend } from 'resend';
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: 'Meeting Prep Engine <noreply@yourdomain.com>',
 *     to: [to],
 *     subject: subject,
 *     html: htmlBody,
 *   });
 */
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
  console.log(`[Email Service] Mocking email delivery to: ${to}`);
  console.log(`[Email Service] Subject: "${subject}"`);
  console.log(`[Email Service] Body size: ${htmlBody.length} characters`);

  try {
    // Save to local /emails directory for developer previewing
    const workspaceRoot = process.cwd();
    const emailDir = path.join(workspaceRoot, 'emails');

    // Ensure the directory exists
    await fs.mkdir(emailDir, { recursive: true });

    // Build unique safe filename: prep-report-ISO-TIMESTAMP.html
    const safeTimestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '_');
    const filename = `prep-report-${safeTimestamp}.html`;
    const filePath = path.join(emailDir, filename);

    // Write file
    await fs.writeFile(filePath, htmlBody, 'utf8');

    console.log(`[Email Service] Draft saved for preview: file://${filePath}`);
  } catch (error) {
    console.error('[Email Service] Failed to save local HTML email draft:', error);
  }
}
