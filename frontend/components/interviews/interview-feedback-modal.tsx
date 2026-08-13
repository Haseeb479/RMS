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
  { id: 'strong_hire', label: 'Strong Hire', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  { id: 'hire', label: 'Hire', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)' },
  { id: 'reconsider', label: 'Reconsider', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
  { id: 'reject', label: 'Reject', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
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
          maxWidth: '540px',
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
              📝 Add Interview Feedback
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', margin: 0 }}>
              Candidate: <strong style={{ color: '#818cf8' }}>{interview.candidate?.firstName} {interview.candidate?.lastName}</strong> ({interview.title})
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
          {/* Star Rating Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Overall Score (1 - 5 Stars)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: rating >= star ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${rating >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ⭐ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendation Options */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Hiring Recommendation
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {RECOMMENDATION_OPTIONS.map((option) => {
                const isSelected = recommendation === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRecommendation(option.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isSelected ? option.bg : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isSelected ? option.color : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? option.color : '#94a3b8',
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Interview Notes & Detailed Feedback *
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Detail key strengths, technical skills demonstrated, concerns, or next steps..."
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5',
              }}
            />
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
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              {submitting ? 'Submitting...' : 'Save Feedback & Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
