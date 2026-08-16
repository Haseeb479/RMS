'use client';

import { useState, useEffect } from 'react';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useJobs } from '@/lib/hooks/usejobs';
import { ScheduleInterviewData } from '@/lib/hooks/useinterviews';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleInterviewData) => Promise<void>;
  defaultCandidateId?: string;
  defaultJobId?: string;
}

const INTERVIEW_TYPES = [
  { id: 'screening', label: 'Screening Call' },
  { id: 'technical', label: 'Technical Interview' },
  { id: 'behavioral', label: 'Behavioral Interview' },
  { id: 'hr', label: 'HR Round' },
  { id: 'culture_fit', label: 'Culture Fit' },
  { id: 'final', label: 'Final Round' },
];

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSubmit,
  defaultCandidateId = '',
  defaultJobId = '',
}: ScheduleInterviewModalProps) {
  const { candidates, fetchCandidates } = useCandidates();
  const { jobs, fetchJobs } = useJobs();

  const [candidateId, setCandidateId] = useState(defaultCandidateId);
  const [jobId, setJobId] = useState(defaultJobId);
  const [title, setTitle] = useState('Technical Interview');
  const [type, setType] = useState('technical');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('Google Meet');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
      fetchJobs();
      if (defaultCandidateId) setCandidateId(defaultCandidateId);
      if (defaultJobId) setJobId(defaultJobId);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setScheduledAt(tomorrow.toISOString().slice(0, 16));

      setFormError(null);
    }
  }, [isOpen, defaultCandidateId, defaultJobId, fetchCandidates, fetchJobs]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) {
      setFormError('Please select a Candidate');
      return;
    }
    if (!title) {
      setFormError('Interview title is required');
      return;
    }
    if (!scheduledAt) {
      setFormError('Scheduled date and time are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onSubmit({
        candidateId,
        jobId: jobId || undefined,
        title,
        type,
        scheduledAt,
        duration: Number(duration),
        location: location || undefined,
        interviewerName: interviewerName || undefined,
        interviewerEmail: interviewerEmail || undefined,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="zr-modal-overlay" onClick={onClose}>
      <div className="zr-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="zr-modal-header">
          <div>
            <div className="zr-modal-title">Schedule Interview Session</div>
            <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
              Set up meeting details, duration, and interviewer assignments
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--zr-muted)',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="zr-modal-body">
            {formError && (
              <div
                style={{
                  background: 'var(--zr-danger-light)',
                  border: '1px solid var(--zr-danger)',
                  borderRadius: '7px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  color: 'var(--zr-danger)',
                  fontSize: '13px',
                }}
              >
                ⚠ {formError}
              </div>
            )}

            {/* Candidate & Job row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="zr-form-group">
                <label className="zr-label">Candidate *</label>
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  required
                  className="zr-input"
                >
                  <option value="">Select candidate...</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="zr-form-group">
                <label className="zr-label">Job Opening (Optional)</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="zr-input"
                >
                  <option value="">Select job...</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Type row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div className="zr-form-group">
                <label className="zr-label">Interview Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Technical Round 1"
                  required
                  className="zr-input"
                />
              </div>

              <div className="zr-form-group">
                <label className="zr-label">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="zr-input"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date/Time & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div className="zr-form-group">
                <label className="zr-label">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="zr-input"
                />
              </div>

              <div className="zr-form-group">
                <label className="zr-label">Duration (Minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="zr-input"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins (1 hr)</option>
                  <option value={90}>90 mins (1.5 hrs)</option>
                </select>
              </div>
            </div>

            {/* Location / Meeting URL */}
            <div className="zr-form-group">
              <label className="zr-label">Meeting URL or Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. https://meet.google.com/xyz or Office Room A"
                className="zr-input"
              />
            </div>

            {/* Interviewer Info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: 0 }}>
              <div className="zr-form-group" style={{ marginBottom: 0 }}>
                <label className="zr-label">Interviewer Name</label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="zr-input"
                />
              </div>

              <div className="zr-form-group" style={{ marginBottom: 0 }}>
                <label className="zr-label">Interviewer Email</label>
                <input
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) => setInterviewerEmail(e.target.value)}
                  placeholder="e.g. sarah@company.com"
                  className="zr-input"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="zr-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="zr-btn zr-btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="zr-btn zr-btn-primary"
              style={{ opacity: submitting ? 0.65 : 1 }}
            >
              {submitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
