'use client';

import { InterviewItem } from '@/lib/hooks/useinterviews';

interface InterviewsListProps {
  interviews: InterviewItem[];
  onOpenFeedback: (interview: InterviewItem) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDeleteInterview: (id: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string }> = {
  scheduled: { label: 'Scheduled', badgeCls: 'zr-badge zr-badge-blue' },
  completed: { label: 'Completed', badgeCls: 'zr-badge zr-badge-green' },
  cancelled: { label: 'Cancelled', badgeCls: 'zr-badge zr-badge-red' },
  rescheduled: { label: 'Rescheduled', badgeCls: 'zr-badge zr-badge-orange' },
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; badgeCls: string }> = {
  strong_hire: { label: 'Strong Hire', badgeCls: 'zr-badge zr-badge-green' },
  hire: { label: 'Hire', badgeCls: 'zr-badge zr-badge-green' },
  reconsider: { label: 'Reconsider', badgeCls: 'zr-badge zr-badge-orange' },
  reject: { label: 'Reject', badgeCls: 'zr-badge zr-badge-red' },
};

export default function InterviewsList({
  interviews,
  onOpenFeedback,
  onUpdateStatus,
  onDeleteInterview,
}: InterviewsListProps) {
  if (interviews.length === 0) {
    return (
      <div className="zr-empty">
        <div className="zr-empty-icon">📅</div>
        <div className="zr-empty-title">No interviews scheduled</div>
        <div className="zr-empty-desc">
          Click &quot;Schedule Interview&quot; above to set up candidate interview sessions.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
      {interviews.map((interview) => {
        const statusCfg = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled;
        const recCfg = interview.recommendation ? RECOMMENDATION_CONFIG[interview.recommendation] : null;
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
            className="zr-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--zr-shadow-sm)',
              transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div>
              {/* Header Badge Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className={statusCfg.badgeCls}>
                  {statusCfg.label}
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--zr-muted)',
                    background: 'var(--zr-bg)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--zr-border)',
                    textTransform: 'capitalize',
                  }}
                >
                  {interview.type}
                </span>
              </div>

              {/* Title & Candidate */}
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', margin: '0 0 4px 0' }}>
                {interview.title}
              </h3>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zr-blue)', marginBottom: '2px' }}>
                👤 {interview.candidate?.firstName} {interview.candidate?.lastName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--zr-muted)', marginBottom: '12px' }}>
                {interview.candidate?.email}
              </div>

              {/* Job Title if linked */}
              {interview.job && (
                <div style={{ fontSize: '12px', color: 'var(--zr-text-2)', marginBottom: '12px', fontWeight: '500' }}>
                  💼 Job: <strong>{interview.job.title}</strong>
                </div>
              )}

              {/* Schedule Info Box */}
              <div
                style={{
                  background: 'var(--zr-bg)',
                  border: '1px solid var(--zr-border)',
                  borderRadius: 'var(--zr-radius)',
                  padding: '10px 12px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--zr-text-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🗓</span>
                  <strong>{formattedDate}</strong> at {formattedTime} ({interview.duration} mins)
                </div>

                {interview.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔗</span>
                    {interview.location.startsWith('http') ? (
                      <a
                        href={interview.location}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--zr-blue)', textDecoration: 'underline' }}
                      >
                        Join Meeting Link
                      </a>
                    ) : (
                      <span>{interview.location}</span>
                    )}
                  </div>
                )}

                {interview.interviewerName && (
                  <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                    🎙 Interviewer: {interview.interviewerName}
                  </div>
                )}
              </div>

              {/* Feedback Summary if present */}
              {interview.feedback && (
                <div
                  style={{
                    background: 'var(--zr-success-light)',
                    border: '1px solid rgba(39, 174, 96, 0.25)',
                    borderRadius: 'var(--zr-radius)',
                    padding: '10px 12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--zr-success)' }}>
                      ⭐ Score: {interview.rating || 0}/5
                    </span>
                    {recCfg && (
                      <span className={recCfg.badgeCls}>
                        {recCfg.label}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--zr-text-2)', margin: 0, lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                    &ldquo;{interview.feedback}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--zr-border-light)' }}>
              <button
                onClick={() => onOpenFeedback(interview)}
                className="zr-btn zr-btn-outline zr-btn-xs"
                style={{ flex: '1 1 auto' }}
              >
                {interview.feedback ? '✏️ Edit Feedback' : '📝 Add Feedback'}
              </button>

              {interview.status === 'scheduled' && (
                <button
                  onClick={() => onUpdateStatus(interview.id, 'completed')}
                  className="zr-btn zr-btn-xs"
                  style={{ background: 'var(--zr-success-light)', color: 'var(--zr-success)', border: '1px solid rgba(39,174,96,0.3)' }}
                >
                  ✓ Mark Complete
                </button>
              )}

              {interview.status === 'scheduled' && (
                <button
                  onClick={() => onUpdateStatus(interview.id, 'cancelled')}
                  className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => onDeleteInterview(interview.id)}
                className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                title="Delete schedule"
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
