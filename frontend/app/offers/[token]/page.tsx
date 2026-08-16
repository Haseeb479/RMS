'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PublicOfferPage() {
  const params = useParams();
  const token = params?.token as string;

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [responseAction, setResponseAction] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/public/offers/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setOffer(data.data);
        else setError(data.error || 'Offer letter not found or link has expired.');
      })
      .catch(() => setError('Could not load offer letter. Please check the link.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRespond = async (action: 'accept' | 'decline') => {
    setResponding(true);
    setResponseAction(action);
    try {
      const res = await fetch(`${API_BASE}/public/offers/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, candidateNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setResponded(true);
        setOffer((prev: any) => ({ ...prev, status: action === 'accept' ? 'accepted' : 'declined' }));
      } else {
        setError(data.error || 'Failed to respond.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setResponding(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zr-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '720px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--zr-muted)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <p>Loading your offer letter...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="zr-card" style={{ padding: '36px', textAlign: 'center', border: '1px solid var(--zr-danger)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>❌</div>
            <h3 style={{ color: 'var(--zr-danger)', fontSize: '18px', fontWeight: '700' }}>Offer Not Found</h3>
            <p style={{ color: 'var(--zr-muted)', marginTop: '8px', fontSize: '13px' }}>{error}</p>
          </div>
        )}

        {/* Offer Content */}
        {!loading && offer && (
          <div>
            {/* Top Branding Banner */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-block',
                background: 'var(--zr-orange-light)',
                border: '1px solid rgba(232, 101, 42, 0.3)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--zr-orange)',
                marginBottom: '10px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>
                📄 Official Employment Offer
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--zr-text)', marginBottom: '4px' }}>
                {offer.company?.name || 'Recruitment Suite'}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--zr-muted)' }}>
                Intended for {offer.candidate?.firstName} {offer.candidate?.lastName}
              </p>
            </div>

            {/* Main Offer Card */}
            <div className="zr-card" style={{ overflow: 'hidden', boxShadow: 'var(--zr-shadow-lg)' }}>
              {/* Status Banner */}
              {(offer.status === 'accepted' || offer.status === 'declined') && (
                <div style={{
                  padding: '12px 24px',
                  background: offer.status === 'accepted' ? 'var(--zr-success-light)' : 'var(--zr-danger-light)',
                  borderBottom: `1px solid ${offer.status === 'accepted' ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`,
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: offer.status === 'accepted' ? 'var(--zr-success)' : 'var(--zr-danger)',
                }}>
                  {offer.status === 'accepted' ? '✓ Offer Accepted & Signed' : '✕ Offer Declined'}
                  {offer.signedAt && (
                    <span style={{ fontWeight: '400', marginLeft: '6px', fontSize: '12px', color: 'var(--zr-muted)' }}>
                      on {new Date(offer.signedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {/* Header Section */}
              <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--zr-text)', marginBottom: '16px' }}>
                  {offer.title}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', padding: '12px 14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--zr-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>👤 Candidate</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)' }}>{offer.candidate?.firstName} {offer.candidate?.lastName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--zr-muted)' }}>{offer.candidate?.email}</div>
                  </div>
                  <div style={{ background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', padding: '12px 14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--zr-success)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>💰 Compensation</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--zr-success)' }}>{offer.salary}</div>
                  </div>
                  <div style={{ background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', padding: '12px 14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--zr-orange)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📅 Start Date</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)' }}>{new Date(offer.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  {offer.job && (
                    <div style={{ background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', padding: '12px 14px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--zr-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>💼 Position</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)' }}>{offer.job.title}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Letter Body */}
              <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px' }}>
                  Terms of Employment
                </h3>
                <div style={{ background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', padding: '20px', color: 'var(--zr-text-2)', fontSize: '13px', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
                  {offer.content}
                </div>
              </div>

              {/* Response Area */}
              {offer.status === 'sent' && !responded && (
                <div style={{ padding: '28px 32px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '14px' }}>
                    ✍️ Candidate E-Signature & Response
                  </h3>

                  <div className="zr-form-group">
                    <label className="zr-label">Notes or Comments (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add any comments or inquiries for the hiring manager..."
                      rows={3}
                      className="zr-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      onClick={() => handleRespond('accept')}
                      disabled={responding}
                      className="zr-btn"
                      style={{
                        padding: '12px',
                        background: 'var(--zr-success)',
                        color: '#fff',
                        borderRadius: 'var(--zr-radius)',
                        fontSize: '14px',
                        fontWeight: '700',
                        justifyContent: 'center',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(39,174,96,0.3)',
                      }}
                    >
                      {responding && responseAction === 'accept' ? 'Signing...' : '✓ Accept & Sign Offer'}
                    </button>
                    <button
                      onClick={() => handleRespond('decline')}
                      disabled={responding}
                      className="zr-btn zr-btn-danger-ghost"
                      style={{
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        justifyContent: 'center',
                      }}
                    >
                      {responding && responseAction === 'decline' ? 'Declining...' : '✕ Decline Offer'}
                    </button>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--zr-muted)', textAlign: 'center', marginTop: '12px' }}>
                    By clicking &quot;Accept &amp; Sign Offer&quot;, you electronically agree to the terms outlined above.
                  </p>
                </div>
              )}

              {/* Responded Confirmation */}
              {responded && (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>{responseAction === 'accept' ? '🎉' : '👋'}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: responseAction === 'accept' ? 'var(--zr-success)' : 'var(--zr-danger)', marginBottom: '6px' }}>
                    {responseAction === 'accept' ? 'Congratulations! Offer Accepted!' : 'Offer Declined'}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--zr-muted)' }}>
                    {responseAction === 'accept'
                      ? 'The hiring team has been notified of your acceptance. Welcome to the team!'
                      : 'Thank you for your response. The hiring team has been notified.'}
                  </p>
                </div>
              )}
            </div>

            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--zr-muted)', marginTop: '20px' }}>
              Powered by RMS Recruit Pro
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
