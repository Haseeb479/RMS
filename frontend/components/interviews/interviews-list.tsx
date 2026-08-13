'use client';

import { InterviewItem } from '@/lib/hooks/useinterviews';

interface InterviewsListProps {
  interviews: InterviewItem[];
  onOpenFeedback: (interview: InterviewItem) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDeleteInterview: (id: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Scheduled', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' },
  completed: { label: 'Completed', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  cancelled: { label: 'Cancelled', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  rescheduled: { label: 'Rescheduled', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  strong_hire: { label: 'Strong Hire', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
  hire: { label: 'Hire', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  reconsider: { label: 'Reconsider', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  reject: { label: 'Reject', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function InterviewsList({
  interviews,
  onOpenFeedback,
  onUpdateStatus,
  onDeleteInterview,
}: InterviewsListProps) {
  if (interviews.length === 0) {
    return (
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
          No interviews scheduled
        </h3>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Click "+ Schedule Interview" above to set up candidate interview sessions.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
      {interviews.map((interview) => {
        const statusStyle = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled;
        const recStyle = interview.recommendation ? RECOMMENDATION_CONFIG[interview.recommendation] : null;
        const dateObj = new Date(interview.scheduledAt);
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedTime = dateObj.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={interview.id}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div>
              {/* Header Badge Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: statusStyle.color,
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                  }}
                >
                  {statusStyle.label}
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#818cf8',
                    background: 'rgba(99, 102, 241, 0.15)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    textTransform: 'capitalize',
                  }}
                >
                  {interview.type}
                </span>
              </div>

              {/* Title & Candidate */}
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>
                {interview.title}
              </h3>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1', marginBottom: '4px' }}>
                👤 {interview.candidate?.firstName} {interview.candidate?.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                ✉️ {interview.candidate?.email}
              </div>

              {/* Job Title if linked */}
              {interview.job && (
                <div style={{ fontSize: '12px', color: '#818cf8', marginBottom: '12px', fontWeight: '500' }}>
                  💼 Job: {interview.job.title}
                </div>
              )}

              {/* Schedule Info Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🗓</span>
                  <strong>{formattedDate}</strong> at {formattedTime} ({interview.duration} mins)
                </div>

                {interview.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                    <span>🔗</span>
                    {interview.location.startsWith('http') ? (
                      <a
                        href={interview.location}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'underline' }}
                      >
                        Join Meeting Link
                      </a>
                    ) : (
                      <span>{interview.location}</span>
                    )}
                  </div>
                )}

                {interview.interviewerName && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    🎙 Interviewer: {interview.interviewerName}
                  </div>
                )}
              </div>

              {/* Feedback Summary if present */}
              {interview.feedback && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#34d399' }}>
                      ⭐ Score: {interview.rating || 0}/5
                    </span>
                    {recStyle && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: recStyle.color,
                          background: recStyle.bg,
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {recStyle.label}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    "{interview.feedback}"
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <button
                onClick={() => onOpenFeedback(interview)}
                style={{
                  flex: '1 1 auto',
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {interview.feedback ? '✏️ Edit Feedback' : '📝 Add Feedback'}
              </button>

              {interview.status === 'scheduled' && (
                <button
                  onClick={() => onUpdateStatus(interview.id, 'completed')}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ✓ Complete
                </button>
              )}

              {interview.status === 'scheduled' && (
                <button
                  onClick={() => onUpdateStatus(interview.id, 'cancelled')}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => onDeleteInterview(interview.id)}
                style={{
                  padding: '8px 10px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#64748b',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                title="Delete Interview"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
