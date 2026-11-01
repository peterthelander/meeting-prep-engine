import type { PrepReport, UserProfile } from '@/types';

/**
 * Parses simple markdown elements (bold, paragraphs, and list items) into inline HTML.
 */
function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Handle bold text (**text**)
  let html = markdown.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f8fafc;">$1</strong>');

  // Handle line breaks and paragraphs/lists
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul style="margin: 8px 0 16px 0; padding-left: 20px; color: #cbd5e1; font-size: 14px;">');
        inList = true;
      }
      const content = line.substring(2);
      processedLines.push(`<li style="margin-bottom: 6px; line-height: 1.5;">${content}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }

      if (line.startsWith('### ')) {
        processedLines.push(`<h4 style="color: #c9a84c; font-size: 15px; font-weight: 600; margin: 20px 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">${line.substring(4)}</h4>`);
      } else if (line.startsWith('## ')) {
        processedLines.push(`<h3 style="color: #c9a84c; font-size: 16px; font-weight: 600; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">${line.substring(3)}</h3>`);
      } else if (line !== '') {
        processedLines.push(`<p style="margin: 0 0 14px 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">${line}</p>`);
      }
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('\n');
}

/**
 * Renders a mobile-responsive, email-client-compatible HTML email body.
 */
export function renderEmailHtml(report: PrepReport, profile: UserProfile): string {
  const formattedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const parsedExecSummary = parseMarkdownToHtml(report.executiveSummary);
  const parsedCriticalChanges = parseMarkdownToHtml(report.criticalChanges);
  const parsedBlindspots = parseMarkdownToHtml(report.competitorBlindspots);
  const parsedPitchAngles = parseMarkdownToHtml(report.tailoredPitchAngles);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <title>Meeting Prep Briefing: ${report.targetFirm}</title>
  <style>
    /* Client-specific Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* Reset Styles */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Media Queries */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 16px !important;
      }
      .card-body {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="background-color: #0a0e1a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <span style="display: none; max-height: 0px; overflow: hidden;">
    Actionable intelligence for your upcoming meeting with ${report.targetFirm}. Prepared for ${profile.name}.
  </span>
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0e1a; min-height: 100vh;">
    <tr>
      <td align="center" valign="top" style="padding: 40px 10px;">
        <!-- Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: #141928; border: 1px solid #1e293b; border-top: 4px solid #c9a84c; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1e293b; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #c9a84c; letter-spacing: 0.15em;">
                      Just-in-Time Intelligence Briefing
                    </p>
                    <h1 style="margin: 6px 0 4px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                      ${report.targetFirm}
                    </h1>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">
                      Generated for <strong>${profile.name}</strong> (${profile.title}, ${profile.firm})
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metadata Ribbon -->
          <tr>
            <td style="background-color: #101420; padding: 12px 32px; border-bottom: 1px solid #1e293b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 11px; color: #94a3b8;">
                    <strong>Date:</strong> ${formattedDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Report Sections -->
          <tr>
            <td class="card-body" style="padding: 32px 32px 24px 32px;">

              <!-- Section: Executive Summary -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #c9a84c; letter-spacing: 0.1em; border-left: 2px solid #c9a84c; padding-left: 10px;">
                      Executive Summary
                    </h2>
                    <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                      ${parsedExecSummary}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Section: Critical Changes (Last 14 Days) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #c9a84c; letter-spacing: 0.1em; border-left: 2px solid #c9a84c; padding-left: 10px;">
                      Critical Changes (Last 14 Days)
                    </h2>
                    <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                      ${parsedCriticalChanges}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Section: Competitor / Regulatory Blindspots -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #c9a84c; letter-spacing: 0.1em; border-left: 2px solid #c9a84c; padding-left: 10px;">
                      Competitor / Regulatory Blindspots
                    </h2>
                    <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                      ${parsedBlindspots}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Section: Tailored Pitch Angles -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; color: #c9a84c; letter-spacing: 0.1em; border-left: 2px solid #c9a84c; padding-left: 10px;">
                      Tailored Pitch Angles & Strategy
                    </h2>
                    <div style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                      ${parsedPitchAngles}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #101420; padding: 24px 32px; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 500;">
                Just-in-Time Meeting Prep Engine
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #475569;">
                Confidential. Prepared for internal use by ${profile.firm}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
