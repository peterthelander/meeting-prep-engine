import type { SearchTermsResult, NewsResult } from '@/types';

/**
 * Simulates a news search loop by returning realistic mock intelligence results.
 * This is designed as a clean interface and logical stub to be later connected
 * to a live search scraper or premium news feed API.
 */
export async function searchNews(termsResult: SearchTermsResult): Promise<NewsResult[]> {
  // Simulate network latency (500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const targetFirm = extractTargetFirm(termsResult);
  const now = new Date();

  // Helper to generate dates in the last 7-14 days
  const getDateAgo = (days: number): string => {
    const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  // Generate dynamic news items based on the search queries
  const mockNews: NewsResult[] = [
    {
      headline: `${targetFirm} Explores Divestment of Healthcare Services Unit Amid Regulatory Scrutiny`,
      summary: `According to sources, ${targetFirm} is weighing options including a sale or spin-off of its healthcare services segment. The move comes as federal regulators increase investigations into private-equity ownership of healthcare delivery networks and clinical practices. Valuations are estimated around $1.4B.`,
      source: 'Wall Street Journal',
      date: getDateAgo(3),
      url: 'https://wsj.com/deals/pe-healthcare-divestments',
      relevanceScore: 92,
      category: 'portfolio',
    },
    {
      headline: 'FTC and DOJ Propose Tightened Guidelines for Sponsor-Backed Roll-up Acquisitions',
      summary: 'Regulatory bodies have released new guidelines aimed directly at Private Equity "roll-up" strategies. The regulations will require deeper disclosures for small, sequential acquisitions in the same sector, historically exempt from Hart-Scott-Rodino filing thresholds. This could affect Leveraged Finance structures and add-on velocity.',
      source: 'Bloomberg Law',
      date: getDateAgo(5),
      url: 'https://bloomberg.com/news/ftc-doj-rollups-guidelines',
      relevanceScore: 88,
      category: 'regulatory',
    },
    {
      headline: `Key Capital Partners Launches Rival LevFin Pool Targeting Mid-Market Add-ons`,
      summary: `Apex Capital's primary competitor, Key Capital, announced the closing of a new $850M private credit vehicle. The fund will specifically target junior debt and senior secured term loans for healthcare and tech add-on acquisitions, offering flexible covenants to PE sponsors.`,
      source: 'Private Debt Investor',
      date: getDateAgo(7),
      url: 'https://privatedebtinvestor.com/key-capital-levfin-pool',
      relevanceScore: 85,
      category: 'competitor',
    },
    {
      headline: 'Leveraged Finance Volume Surges 22% in Healthcare Services Sector',
      summary: 'A new report on leveraged loans shows healthcare sector volumes rising despite higher benchmark interest rates. Sponsors are increasingly utilizing customized unitranche loans from private credit lenders to bypass sluggish syndicated markets for add-on transactions.',
      source: 'Reuters Financial',
      date: getDateAgo(9),
      url: 'https://reuters.com/finance/healthcare-loans-volume',
      relevanceScore: 81,
      category: 'market',
    },
    {
      headline: `${targetFirm} Recruits Senior Healthcare MD from Competitor for Expansion`,
      summary: `${targetFirm} has appointed Marcus Vance, former Lead Partner of Healthcare Credit at a rival fund, as Managing Director to lead its expanded healthcare leveraged finance and corporate credit portfolio. Vance brings 18 years of sector relationship experience.`,
      source: 'Buyouts Insider',
      date: getDateAgo(11),
      url: 'https://buyoutsinsider.com/personnel/marcus-vance-moves',
      relevanceScore: 78,
      category: 'personnel',
    },
    {
      headline: `State Medicaid Reimbursement Policy Shifts Put Pressure on Provider Valuations`,
      summary: 'Several major states have revised reimbursement structures for home healthcare and specialty outpatient networks. Analyst reports indicate these adjustments will compress margins for sponsor-backed provider groups, requiring renegotiation of leverage covenants.',
      source: 'Healthcare Dive',
      date: getDateAgo(12),
      url: 'https://healthcaredive.com/policy/medicaid-reimbursement-shift',
      relevanceScore: 84,
      category: 'regulatory',
    },
    {
      headline: `Sponsor-backed Clinical Network Defaults on Credit Line Covenants`,
      summary: 'A mid-market pediatric healthcare platform backed by a regional PE firm has initiated debt restructuring talks after breaching leverage ratio covenants. Rising labor costs and slower-than-expected add-on integration were cited as primary pressures.',
      source: 'Debtwire',
      date: getDateAgo(13),
      url: 'https://debtwire.com/restructuring/pediatric-network-covenants',
      relevanceScore: 79,
      category: 'market',
    },
    {
      headline: `${targetFirm} Portfolio Company Completes Strategic Healthcare IT Merger`,
      summary: `MediCore Technologies, a key portfolio company of ${targetFirm}, has closed its acquisition of CareFlow Systems. The merger is structured to consolidate mid-office clinical workflow software, aiming for immediate cost-synergies and EBITDA improvement.`,
      source: 'PE Hub',
      date: getDateAgo(14),
      url: 'https://pehub.com/deals/medicore-careflow-merger',
      relevanceScore: 90,
      category: 'portfolio',
    }
  ];

  // Refine results dynamically if specific terms are present in queries
  return mockNews.filter(item => {
    // Keep most items, but boost scores or filter slightly based on terms to simulate real search matching
    const queryStr = termsResult.terms.map(t => t.query.toLowerCase()).join(' ');

    // If the query specifically targets something not in healthcare, we customize relevance
    if (!queryStr.includes('healthcare') && item.headline.toLowerCase().includes('healthcare')) {
      item.relevanceScore -= 10; // lower relevance if not healthcare-focused
    }

    return item.relevanceScore > 60;
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Utility to extract a likely target firm name from the search terms
 */
function extractTargetFirm(termsResult: SearchTermsResult): string {
  if (termsResult.terms.length === 0) return 'Target Sponsor';

  // Try to find a capitalized word in the first query that isn't a standard search operator
  const firstQuery = termsResult.terms[0].query;
  const words = firstQuery.split(' ');
  const properNouns = words.filter(w => w && w[0] === w[0].toUpperCase() && !['AND', 'OR', 'NOT', 'NEWS', 'PE', 'LBO', 'M&A'].includes(w.toUpperCase()));

  return properNouns.length > 0 ? properNouns[0].replace(/['"s]/g, '') : 'Target Sponsor';
}
