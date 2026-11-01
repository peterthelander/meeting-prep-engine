export interface UserProfile {
  name: string;
  title: string;
  firm: string;
  email: string;
}

export interface MeetingRequest {
  targetFirm: string;
  objective: string;
  historicalContext: string;
}

export interface PrepSubmission {
  profile: UserProfile;
  meeting: MeetingRequest;
}

export interface SearchTerm {
  query: string;
  focusArea: string;
}

export interface SearchTermsResult {
  terms: SearchTerm[];
  dateRange: {
    from: string;
    to: string;
  };
  rationale: string;
}

export interface NewsResult {
  headline: string;
  summary: string;
  source: string;
  date: string;
  url: string;
  relevanceScore: number;
  category: 'regulatory' | 'competitor' | 'portfolio' | 'market' | 'personnel';
}

export interface PrepReport {
  executiveSummary: string;
  criticalChanges: string;
  competitorBlindspots: string;
  tailoredPitchAngles: string;
  generatedAt: string;
  targetFirm: string;
}
