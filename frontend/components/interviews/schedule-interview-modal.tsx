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

      // Default to tomorrow 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setScheduledAt(tomorrow.toISOString().slice(0, 16));

      setFormError(null);
    }
  }, [isOpen, defaultCandidateId, defaultJobId]);

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0f172a, #1e293b)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          color: '#f8fafc',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              📅 Schedule Interview
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              Set up a new candidate interview session
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {formError && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#f87171',
              fontSize: '13px',
            }}
          >
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Candidate Select */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Candidate *
            </label>
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">-- Select Candidate --</option>
              {candidates.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Job Select */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Job Position (Optional)
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">-- Select Job (Optional) --</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.id}>
                  {j.title} {j.location ? `(${j.location})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Type Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Interview Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Technical Round 1"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Interview Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Duration (minutes)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 hr)</option>
                <option value={90}>90 mins (1.5 hrs)</option>
              </select>
            </div>
          </div>

          {/* Location / Meeting Link */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Meeting Link / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Google Meet link or Room 402"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Interviewer Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Interviewer Name
              </label>
              <input
                type="text"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Interviewer Email
              </label>
              <input
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              {submitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
