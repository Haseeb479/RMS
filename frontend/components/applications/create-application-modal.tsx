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
  }, [isOpen, defaultJobId, fetchCandidates, fetchJobs]);

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
    <div className="zr-modal-overlay" onClick={onClose}>
      <div className="zr-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="zr-modal-header">
          <div>
            <div className="zr-modal-title">Link Candidate to Opening</div>
            <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
              Add a candidate into a specific job hiring pipeline
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

            {/* Select Job */}
            <div className="zr-form-group">
              <label className="zr-label">Target Job Opening *</label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                required
                className="zr-input"
              >
                <option value="">Select a job position...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} {j.location ? `(${j.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Candidate */}
            <div className="zr-form-group">
              <label className="zr-label">Candidate *</label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                required
                className="zr-input"
              >
                <option value="">Select candidate from database...</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Stage */}
            <div className="zr-form-group" style={{ marginBottom: 0 }}>
              <label className="zr-label">Initial Pipeline Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="zr-input"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
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
              {submitting ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
