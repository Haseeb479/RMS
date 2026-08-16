'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { api } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  draft:    'zr-badge zr-badge-gray',
  sent:     'zr-badge zr-badge-blue',
  accepted: 'zr-badge zr-badge-green',
  declined: 'zr-badge zr-badge-red',
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function OffersPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    title: '',
    salary: '',
    startDate: '',
    content: '',
  });

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    fetchAll();
  }, [isLoggedIn, router]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [offersRes, candidatesRes, jobsRes] = await Promise.all([
        api.get('/offers'),
        api.get('/candidates'),
        api.get('/jobs?status=published'),
      ]);
      setOffers(Array.isArray(offersRes.data.data) ? offersRes.data.data : []);
      const candData = candidatesRes.data.data;
      const candList = Array.isArray(candData)
        ? candData
        : Array.isArray(candData?.candidates)
        ? candData.candidates
        : [];
      setCandidates(candList);
      setJobs(Array.isArray(jobsRes.data.data) ? jobsRes.data.data : []);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateId || !form.title || !form.salary || !form.startDate) {
      setFormError('Candidate, Title, Salary, and Start Date are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.post('/offers', form);
      setShowModal(false);
      setForm({ candidateId: '', jobId: '', title: '', salary: '', startDate: '', content: '' });
      fetchAll();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyOfferLink = (token: string) => {
    const url = `${window.location.origin}/offers/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const acceptedCount = offers.filter(o => o.status === 'accepted').length;
  const pendingCount = offers.filter(o => o.status === 'sent' || o.status === 'draft').length;
  const declinedCount = offers.filter(o => o.status === 'declined').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Offer Letters</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Generate, send, and track candidate job offer letters with e-signature
            </p>
          </div>
          <button onClick={() => { setShowModal(true); setFormError(''); }} className="zr-btn zr-btn-primary zr-btn-sm">
            <PlusIcon /> Create Offer Letter
          </button>
        </div>

        <div className="zr-content">

          {/* Metric cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14, marginBottom: 20,
          }}>
            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                📄
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Issued</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-text)', marginTop: 2 }}>{offers.length}</div>
              </div>
            </div>

            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                ⏳
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Response</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-orange)', marginTop: 2 }}>{pendingCount}</div>
              </div>
            </div>

            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accepted</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-success)', marginTop: 2 }}>{acceptedCount}</div>
              </div>
            </div>

            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                ✕
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Declined</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-danger)', marginTop: 2 }}>{declinedCount}</div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--zr-danger)', fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--zr-muted)', fontSize: 13 }}>Loading offer letters...</div>
          ) : offers.length === 0 ? (
            <div className="zr-empty">
              <div className="zr-empty-icon">📄</div>
              <div className="zr-empty-title">No Offer Letters Created</div>
              <div className="zr-empty-desc">Create your first official offer letter and send it to a candidate for online review and acceptance.</div>
              <button onClick={() => setShowModal(true)} className="zr-btn zr-btn-primary zr-btn-sm">
                <PlusIcon /> Create Offer Letter
              </button>
            </div>
          ) : (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <table className="zr-table">
                <thead>
                  <tr>
                    <th>Offer Title & Position</th>
                    <th>Candidate</th>
                    <th>Salary</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => {
                    const badgeClass = STATUS_BADGE[offer.status] || 'zr-badge zr-badge-gray';
                    const offerUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/offers/${offer.token}`;

                    return (
                      <tr key={offer.id}>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--zr-text)', fontSize: 13 }}>{offer.title}</span>
                            {offer.job?.title && (
                              <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 2 }}>
                                {offer.job.title}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: 'var(--zr-text-2)', fontSize: 13 }}>
                            {offer.candidate ? `${offer.candidate.firstName} ${offer.candidate.lastName}` : 'Candidate'}
                          </span>
                          {offer.candidate?.email && (
                            <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{offer.candidate.email}</div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--zr-text)', fontSize: 13 }}>
                          {offer.salary}
                        </td>
                        <td style={{ color: 'var(--zr-text-2)', fontSize: 12 }}>
                          {new Date(offer.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={badgeClass}>{offer.status}</span>
                        </td>
                        <td style={{ color: 'var(--zr-muted)', fontSize: 12 }}>
                          {new Date(offer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => copyOfferLink(offer.token)}
                              className={`zr-btn zr-btn-xs ${copiedToken === offer.token ? 'zr-btn-primary' : 'zr-btn-outline'}`}
                              title="Copy Candidate Link"
                            >
                              <CopyIcon />
                              {copiedToken === offer.token ? 'Copied' : 'Link'}
                            </button>
                            <a href={offerUrl} target="_blank" rel="noopener noreferrer">
                              <button className="zr-btn zr-btn-ghost zr-btn-xs" title="Open Offer Letter Page">
                                <ExternalIcon /> View
                              </button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Create Offer Modal */}
      {showModal && (
        <div className="zr-modal-overlay">
          <div className="zr-modal" style={{ maxWidth: 580 }}>
            <div className="zr-modal-header">
              <div>
                <div className="zr-modal-title">Create Job Offer Letter</div>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
                  Issue an official employment proposal for candidate acceptance
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zr-muted)', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="zr-modal-body">
                {formError && (
                  <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 7, padding: '10px 14px', marginBottom: 16, color: 'var(--zr-danger)', fontSize: 13 }}>
                    ⚠ {formError}
                  </div>
                )}

                <div className="zr-form-group">
                  <label className="zr-label">Select Candidate *</label>
                  <select
                    value={form.candidateId}
                    onChange={(e) => setForm((p) => ({ ...p, candidateId: e.target.value }))}
                    required
                    className="zr-input"
                  >
                    <option value="">Choose candidate...</option>
                    {(Array.isArray(candidates) ? candidates : []).map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Associated Job Opening</label>
                  <select
                    value={form.jobId}
                    onChange={(e) => setForm((p) => ({ ...p, jobId: e.target.value }))}
                    className="zr-input"
                  >
                    <option value="">Select job (optional)...</option>
                    {(Array.isArray(jobs) ? jobs : []).map((j) => (
                      <option key={j.id} value={j.id}>{j.title} {j.location ? `(${j.location})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Offer Title / Position *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="zr-form-group">
                    <label className="zr-label">Annual Salary / Comp *</label>
                    <input
                      type="text"
                      placeholder="e.g. $125,000 / year"
                      value={form.salary}
                      onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
                      required
                      className="zr-input"
                    />
                  </div>
                  <div className="zr-form-group">
                    <label className="zr-label">Expected Start Date *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      required
                      className="zr-input"
                    />
                  </div>
                </div>

                <div className="zr-form-group" style={{ marginBottom: 0 }}>
                  <label className="zr-label">Offer Terms & Notes</label>
                  <textarea
                    placeholder="Additional benefits, stock options, reporting details..."
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="zr-input"
                    style={{ minHeight: 90, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="zr-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="zr-btn zr-btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="zr-btn zr-btn-primary" style={{ opacity: saving ? 0.65 : 1 }}>
                  {saving ? 'Creating...' : 'Generate Offer Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
