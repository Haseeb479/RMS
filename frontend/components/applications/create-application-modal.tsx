'use client';

import { useState, useEffect } from 'react';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useJobs } from '@/lib/hooks/usejobs';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { jobId: string; candidateId: string; status: string }) => Promise<void>;
  defaultJobId?: string;
}

const STAGES = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer Sent' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export default function CreateApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  defaultJobId,
}: CreateApplicationModalProps) {
  const { candidates, fetchCandidates } = useCandidates();
  const { jobs, fetchJobs } = useJobs();

  const [jobId, setJobId] = useState(defaultJobId || '');
  const [candidateId, setCandidateId] = useState('');
  const [status, setStatus] = useState('applied');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
      fetchJobs();
      if (defaultJobId) setJobId(defaultJobId);
      setFormError(null);
    }
  }, [isOpen, defaultJobId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      setFormError('Please select a Job');
      return;
    }
    if (!candidateId) {
      setFormError('Please select a Candidate');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onSubmit({ jobId, candidateId, status });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
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
          maxWidth: '520px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          color: '#f8fafc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              + Add Application to Pipeline
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              Link a candidate to an active job opening
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
          {/* Job Select */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Job Opening *
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
              <option value="">-- Select Job --</option>
              {jobs.map((j: any) => (
                <option key={j.id} value={j.id}>
                  {j.title} {j.location ? `(${j.location})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Candidate Select */}
          <div style={{ marginBottom: '16px' }}>
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

          {/* Initial Stage */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Initial Pipeline Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
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
              {submitting ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
