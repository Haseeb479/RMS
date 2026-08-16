'use client';

import { useState, useEffect } from 'react';
import { InterviewItem, InterviewFeedbackData } from '@/lib/hooks/useinterviews';

interface InterviewFeedbackModalProps {
  isOpen: boolean;
  interview: InterviewItem | null;
  onClose: () => void;
  onSubmit: (id: string, data: InterviewFeedbackData) => Promise<void>;
}

const RECOMMENDATION_OPTIONS = [
  { id: 'strong_hire', label: 'Strong Hire', color: '#27AE60', bg: 'var(--zr-success-light)', border: 'rgba(39, 174, 96, 0.3)' },
  { id: 'hire', label: 'Hire', color: '#27AE60', bg: 'var(--zr-success-light)', border: 'rgba(39, 174, 96, 0.3)' },
  { id: 'reconsider', label: 'Reconsider', color: '#E8652A', bg: 'var(--zr-orange-light)', border: 'rgba(232, 101, 42, 0.3)' },
  { id: 'reject', label: 'Reject', color: '#E74C3C', bg: 'var(--zr-danger-light)', border: 'rgba(231, 76, 60, 0.3)' },
];

export default function InterviewFeedbackModal({
  isOpen,
  interview,
  onClose,
  onSubmit,
}: InterviewFeedbackModalProps) {
  const [rating, setRating] = useState<number>(4);
  const [recommendation, setRecommendation] = useState<string>('hire');
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && interview) {
      setRating(interview.rating || 4);
      setRecommendation(interview.recommendation || 'hire');
      setFeedback(interview.feedback || '');
      setFormError(null);
    }
  }, [isOpen, interview]);

  if (!isOpen || !interview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setFormError('Please provide interview evaluation notes');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onSubmit(interview.id, {
        rating,
        recommendation,
        feedback,
        status: 'completed',
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="zr-modal-overlay" onClick={onClose}>
      <div className="zr-modal" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="zr-modal-header">
          <div>
            <div className="zr-modal-title">Interview Evaluation & Rating</div>
            <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
              Evaluate {interview.candidate?.firstName} {interview.candidate?.lastName} for {interview.title}
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

        {/* Form */}
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

            {/* Star Rating Select */}
            <div className="zr-form-group">
              <label className="zr-label">Candidate Score (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: rating >= star ? 'var(--zr-orange-light)' : 'var(--zr-bg)',
                      border: `1px solid ${rating >= star ? 'var(--zr-orange)' : 'var(--zr-border)'}`,
                      color: rating >= star ? 'var(--zr-orange)' : 'var(--zr-muted)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '700',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>⭐</span> {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Chips */}
            <div className="zr-form-group">
              <label className="zr-label">Hiring Recommendation</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {RECOMMENDATION_OPTIONS.map((rec) => {
                  const isSelected = recommendation === rec.id;
                  return (
                    <button
                      type="button"
                      key={rec.id}
                      onClick={() => setRecommendation(rec.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isSelected ? rec.color : 'var(--zr-border)'}`,
                        background: isSelected ? rec.bg : 'var(--zr-white)',
                        color: isSelected ? rec.color : 'var(--zr-text-2)',
                        fontWeight: isSelected ? '700' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {rec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Notes */}
            <div className="zr-form-group" style={{ marginBottom: 0 }}>
              <label className="zr-label">Interview Notes & Observations *</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Highlight candidate strengths, technical proficiency, areas for improvement..."
                rows={4}
                required
                className="zr-input"
                style={{ resize: 'vertical' }}
              />
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
              {submitting ? 'Saving...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
