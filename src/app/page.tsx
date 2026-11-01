'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, MeetingRequest, PrepSubmission } from '@/types';

const PROFILE_STORAGE_KEY = 'meeting-prep-profile';

const defaultProfile: UserProfile = {
  name: '',
  title: '',
  firm: '',
  email: '',
};

const defaultMeeting: MeetingRequest = {
  targetFirm: '',
  objective: '',
  historicalContext: '',
};

function loadProfile(): UserProfile | null {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as UserProfile;
    if (parsed.name || parsed.title || parsed.firm || parsed.email) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Silently fail
  }
}

/* ---------- Chevron Icon ---------- */
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ---------- Checkmark Icon ---------- */
function CheckmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ============================================================
   Main Page Component
   ============================================================ */
export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [meetingRequest, setMeetingRequest] = useState<MeetingRequest>(defaultMeeting);
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  /* Load profile from localStorage on mount */
  useEffect(() => {
    const stored = loadProfile();
    if (stored) {
      setUserProfile(stored);
      setIsProfileExpanded(false);
      setHasSavedProfile(true);
    }
    setProfileLoaded(true);
  }, []);

  /* Persist profile on change (after initial load) */
  const updateProfile = useCallback(
    (field: keyof UserProfile, value: string) => {
      setUserProfile((prev) => {
        const updated = { ...prev, [field]: value };
        saveProfile(updated);
        setHasSavedProfile(
          !!(updated.name || updated.title || updated.firm || updated.email)
        );
        return updated;
      });
    },
    []
  );

  const updateMeeting = useCallback(
    (field: keyof MeetingRequest, value: string) => {
      setMeetingRequest((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /* Validation */
  const isFormValid =
    userProfile.name.trim() !== '' &&
    userProfile.email.trim() !== '' &&
    meetingRequest.targetFirm.trim() !== '' &&
    meetingRequest.objective.trim() !== '';

  /* Submit */
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);

    const payload: PrepSubmission = {
      profile: userProfile,
      meeting: meetingRequest,
    };

    try {
      await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Even on error, we show the confirmation (fire-and-forget UX)
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  /* Reset */
  const handleReset = () => {
    setMeetingRequest(defaultMeeting);
    setIsSubmitted(false);
  };

  /* Don't render until profile hydration completes to avoid flash */
  if (!profileLoaded) {
    return (
      <main>
        <div className="container" />
      </main>
    );
  }

  /* ======================== Confirmation View ======================== */
  if (isSubmitted) {
    return (
      <main>
        <div className="container">
          <header className="header">
            <h1 className="header-title">Meeting Prep Engine</h1>
            <p className="header-tagline">Just-in-Time Intelligence for Elite Advisors</p>
          </header>

          <div className="confirmation">
            <div className="confirmation-card">
              <div className="confirmation-checkmark">
                <CheckmarkIcon />
              </div>
              <h2 className="confirmation-title">Report Generation Started</h2>
              <p className="confirmation-text">
                Your prep report is being generated and will be emailed to{' '}
                <span className="confirmation-email">{userProfile.email}</span>{' '}
                within a few minutes. You can safely close this tab.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                ← Prepare Another
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ======================== Form View ======================== */
  return (
    <main>
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Meeting Prep Engine</h1>
          <p className="header-tagline">Just-in-Time Intelligence for Elite Advisors</p>
        </header>

        {/* Profile Section — Collapsible */}
        <div className="card">
          <div
            className={`card-header${isProfileExpanded ? ' has-border' : ''}`}
            onClick={() => setIsProfileExpanded((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-expanded={isProfileExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsProfileExpanded((prev) => !prev);
              }
            }}
          >
            <div className="card-header-left">
              <span className="card-header-title">Your Profile</span>
              {hasSavedProfile && (
                <span className="profile-saved-badge">Saved</span>
              )}
            </div>
            <ChevronIcon
              className={`card-header-chevron${isProfileExpanded ? ' expanded' : ''}`}
            />
          </div>

          <div className={`card-content${isProfileExpanded ? ' expanded' : ' collapsed'}`}>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="profile-name" className="form-label">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  placeholder="Jane Smith"
                  value={userProfile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-title" className="form-label">
                  Title
                </label>
                <input
                  id="profile-title"
                  type="text"
                  className="form-input"
                  placeholder="Managing Director"
                  value={userProfile.title}
                  onChange={(e) => updateProfile('title', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-firm" className="form-label">
                  Firm
                </label>
                <input
                  id="profile-firm"
                  type="text"
                  className="form-input"
                  placeholder="Apex Capital Partners"
                  value={userProfile.firm}
                  onChange={(e) => updateProfile('firm', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email" className="form-label">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  placeholder="jane.smith@apexcapital.com"
                  value={userProfile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="card">
          <div className="card-body">
            <h2 className="section-title">Meeting Details</h2>

            <div className="form-group">
              <label htmlFor="target-firm" className="form-label">
                Target Firm
              </label>
              <input
                id="target-firm"
                type="text"
                className="form-input"
                placeholder="Blackstone, KKR, Carlyle…"
                value={meetingRequest.targetFirm}
                onChange={(e) => updateMeeting('targetFirm', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="objective" className="form-label">
                Meeting Objective
              </label>
              <input
                id="objective"
                type="text"
                className="form-input"
                placeholder="Initial LP pitch for Fund VII"
                value={meetingRequest.objective}
                onChange={(e) => updateMeeting('objective', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="historical-context" className="form-label">
                Historical Context / Notes
              </label>
              <textarea
                id="historical-context"
                className="form-input form-textarea"
                placeholder="Include any prior interactions, relevant deal history, key contacts, or specific topics you want covered in the prep report…"
                value={meetingRequest.historicalContext}
                onChange={(e) =>
                  updateMeeting('historicalContext', e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="btn-primary"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" />
              Generating…
            </>
          ) : (
            'Generate Prep Report'
          )}
        </button>
      </div>
    </main>
  );
}
