'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import { useCandidates } from '@/lib/hooks/usecandidates';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

export default function NewCandidatePage() {
  const { isLoggedIn } = useAuth();
  const { company } = useCompany();
  const { createCandidate } = useCandidates();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState('new');
  const [score, setScore] = useState('85');
  const [source, setSource] = useState('direct_referral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  const portalSlug = company?.slug || '';
  const portalUrl = portalSlug ? `/careers/${portalSlug}` : '/careers';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && portalSlug) {
      const fullUrl = `${window.location.origin}/careers/${portalSlug}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createCandidate({
        firstName,
        lastName,
        email,
        phone,
        skills,
        status,
        score: Number(score),
        source,
      });

      router.push('/candidates');
    } catch (err: any) {
      setError(err.message || 'Failed to add candidate. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/candidates" style={{ color: 'var(--zr-muted)', fontSize: 13, textDecoration: 'none' }}>
                ← Candidates
              </Link>
              <span style={{ color: 'var(--zr-border)' }}>/</span>
              <h1 className="zr-subheader-title">Add New Candidate</h1>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Add a candidate directly or invite them via your public career portal
            </p>
          </div>
          {portalSlug && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="zr-btn zr-btn-outline zr-btn-sm"
              >
                {copied ? '✓ Portal Link Copied' : '🔗 Copy Career Site Link'}
              </button>
              <Link href={portalUrl} target="_blank">
                <button type="button" className="zr-btn zr-btn-blue zr-btn-sm">
                  🌐 Visit Live Portal ↗
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="zr-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Public Portal Info Card */}
          <div className="zr-card" style={{ padding: '18px 20px', marginBottom: '20px', background: 'linear-gradient(135deg, #EEF4FF 0%, #FFFFFF 100%)', borderColor: '#C7D9FB' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--zr-blue)', color: '#fff',
                  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  🌐
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)' }}>
                    {company?.name ? `${company.name} Career Portal` : 'Online Career Portal'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
                    Candidates can apply directly to open jobs at <span style={{ color: 'var(--zr-blue)', fontWeight: 600 }}>/careers/{portalSlug || 'your-company'}</span> with auto-parsing and Groq AI ATS scoring.
                  </div>
                </div>
              </div>

              {portalSlug && (
                <Link href={portalUrl} target="_blank">
                  <button type="button" className="zr-btn zr-btn-outline zr-btn-xs" style={{ background: '#fff' }}>
                    Open Public Portal ↗
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Direct Candidate Entry Form */}
          <div className="zr-card">
            <div className="zr-card-header">
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  Direct Candidate Entry
                </h2>
                <span style={{ fontSize: 12, color: 'var(--zr-muted)' }}>
                  Add a candidate manually to your recruitment pipeline
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="zr-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label className="zr-label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="zr-input"
                  />
                </div>

                <div>
                  <label className="zr-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="e.g. Jenkins"
                    className="zr-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label className="zr-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sarah.jenkins@example.com"
                    className="zr-input"
                  />
                </div>

                <div>
                  <label className="zr-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="zr-input"
                  />
                </div>
              </div>

              <div>
                <label className="zr-label">Skills & Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, AWS"
                  className="zr-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label className="zr-label">Pipeline Stage</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="zr-input"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="zr-label">Sourcing Source</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="zr-input"
                  >
                    <option value="direct_referral">Direct / Referral</option>
                    <option value="linkedin_outreach">LinkedIn Outreach</option>
                    <option value="internal_transfer">Internal Mobility</option>
                    <option value="agency">Recruitment Agency</option>
                    <option value="walk_in">Walk-in / Direct Contact</option>
                  </select>
                </div>

                <div>
                  <label className="zr-label">Initial ATS Match Score (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={score}
                    onChange={e => setScore(e.target.value)}
                    className="zr-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 16, borderTop: '1px solid var(--zr-border-light)' }}>
                <Link href="/candidates">
                  <button type="button" className="zr-btn zr-btn-outline">
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="zr-btn zr-btn-primary"
                >
                  {loading ? 'Adding Candidate...' : '✓ Save & Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}