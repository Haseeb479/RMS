'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useResume } from '@/lib/hooks/useresume';
import { useAts } from '@/lib/hooks/useats';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

/* ─────────────────────────── helpers ─────────────────────────── */
const STATUSES = ['new', 'contacted', 'shortlisted', 'hired', 'rejected'] as const;
type Status = typeof STATUSES[number];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string; badge: string }> = {
  new:         { label: 'New',         color: '#1473E6', bg: '#EEF4FF', border: '#1473E622', badge: 'zr-badge zr-badge-blue' },
  contacted:   { label: 'Contacted',   color: '#E8652A', bg: '#FFF4EE', border: '#E8652A22', badge: 'zr-badge zr-badge-orange' },
  shortlisted: { label: 'Shortlisted', color: '#8B5CF6', bg: '#F5F0FF', border: '#8B5CF622', badge: 'zr-badge zr-badge-purple' },
  hired:       { label: 'Hired',       color: '#27AE60', bg: '#EDFBF4', border: '#27AE6022', badge: 'zr-badge zr-badge-green' },
  rejected:    { label: 'Rejected',    color: '#E53E3E', bg: '#FFF0F0', border: '#E53E3E22', badge: 'zr-badge zr-badge-red' },
};

const TAG_COLORS = ['#1473E6','#8B5CF6','#E8652A','#27AE60','#E53E3E','#F59E0B','#06B6D4','#EC4899'];

function parseSkills(raw: any): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function ScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return null;
  const pct = Math.round(score);
  const color = pct >= 80 ? '#27AE60' : pct >= 60 ? '#1473E6' : '#E8652A';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 700, color,
      background: color + '18', borderRadius: 20, padding: '2px 7px',
    }}>
      ⭐ {pct}% Match
    </span>
  );
}

function TagPill({ tag, index }: { tag: string; index: number }) {
  const color = TAG_COLORS[index % TAG_COLORS.length];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color,
      background: color + '18', borderRadius: 20, padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}>{tag}</span>
  );
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0] || '').join('').slice(0,2).toUpperCase() || 'C';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--zr-orange) 0%, #FF8C5A 100%)',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ─────────────────────────── icons ───────────────────────────── */
const IconList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconKanban = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18"/><rect x="10" y="3" width="5" height="12"/><rect x="17" y="3" width="5" height="15"/>
  </svg>
);
const IconDownload = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ═══════════════════════════ PAGE ══════════════════════════════ */
export default function CandidatesDashboardPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    candidates, loading, error, pagination, stats,
    fetchCandidates, fetchStats, updateCandidate, deleteCandidate,
  } = useCandidates();
  const { downloadResume } = useResume();
  const { generateEmail, sendEmail } = useAts();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [atsTierFilter, setAtsTierFilter] = useState<'all' | 'top' | 'moderate' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMsg, setActionMsg]     = useState<string | null>(null);
  const [viewMode, setViewMode]       = useState<'list' | 'kanban'>('list');

  // AI Email Modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailCandidate, setEmailCandidate] = useState<any>(null);
  const [emailType, setEmailType] = useState<'interview_invitation' | 'application_ack' | 'rejection' | 'custom'>('interview_invitation');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [dispatchingEmail, setDispatchingEmail] = useState(false);

  useEffect(() => { if (!isLoggedIn) router.push('/auth/login'); }, [isLoggedIn, router]);

  const load = useCallback(() => {
    if (!isLoggedIn) return;
    fetchCandidates({ search, status: statusFilter, page: currentPage });
    fetchStats();
  }, [isLoggedIn, search, statusFilter, currentPage]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      setUpdatingId(candidateId);
      setActionError(null);
      await updateCandidate(candidateId, { status: newStatus });
      load();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update candidate status');
    } finally { setUpdatingId(null); }
  };

  const handleDelete = async (candidateId: string, candidateName: string) => {
    if (!window.confirm(`Remove candidate "${candidateName}"?`)) return;
    try {
      setActionError(null);
      await deleteCandidate(candidateId);
      load();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete candidate');
    }
  };

  // Open AI Email Modal
  const handleOpenEmailModal = async (c: any) => {
    setEmailCandidate(c);
    setEmailModalOpen(true);
    setEmailSubject('');
    setEmailBody('');
    await handleGenerateDraft(c, 'interview_invitation');
  };

  const handleGenerateDraft = async (
    c: any = emailCandidate,
    type: 'interview_invitation' | 'application_ack' | 'rejection' | 'custom' = emailType
  ) => {
    if (!c) return;
    try {
      setGeneratingDraft(true);
      const skills = parseSkills(c.skills);
      const jobTitle = c.applications?.[0]?.job?.title || 'Open Position';

      const draft = await generateEmail({
        type,
        candidateName: `${c.firstName} ${c.lastName}`,
        candidateEmail: c.email,
        candidateSkills: skills,
        atsScore: c.score ? Math.round(c.score) : 85,
        jobTitle,
      });

      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
    } catch (err: any) {
      setEmailSubject(`Interview Invitation: Career Opportunity at RMS`);
      setEmailBody(`Dear ${c.firstName} ${c.lastName},\n\nWe reviewed your credentials (ATS Match: ${c.score ? Math.round(c.score) : 85}%) and would love to invite you for an interview.`);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendEmailConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCandidate) return;

    try {
      setDispatchingEmail(true);
      await sendEmail({
        candidateId: emailCandidate.id,
        candidateName: `${emailCandidate.firstName} ${emailCandidate.lastName}`,
        candidateEmail: emailCandidate.email,
        subject: emailSubject,
        body: emailBody,
        type: emailType,
      });

      setEmailModalOpen(false);
      setEmailCandidate(null);
      setActionMsg(`✓ Email successfully sent and logged to candidate timeline!`);
      setTimeout(() => setActionMsg(null), 4000);
      load();
    } catch (err: any) {
      setActionError(err.message || 'Failed to send email');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setDispatchingEmail(false);
    }
  };

  if (!isLoggedIn) return null;

  // Filter candidates by ATS Tier
  const filteredCandidates = candidates.filter((c) => {
    if (atsTierFilter === 'all') return true;
    const s = c.score || 0;
    if (atsTierFilter === 'top') return s >= 80;
    if (atsTierFilter === 'moderate') return s >= 60 && s < 80;
    if (atsTierFilter === 'low') return s < 60;
    return true;
  });

  const statCards = [
    { label: 'Total',       value: stats?.total ?? 0,                    color: 'var(--zr-text)',    border: 'var(--zr-border)' },
    { label: 'New',         value: stats?.byStatus?.new ?? 0,            color: '#1473E6',           border: '#1473E622' },
    { label: 'Contacted',   value: stats?.byStatus?.contacted ?? 0,      color: '#E8652A',           border: '#E8652A22' },
    { label: 'Shortlisted', value: stats?.byStatus?.shortlisted ?? 0,    color: '#8B5CF6',           border: '#8B5CF622' },
    { label: 'Hired',       value: stats?.byStatus?.hired ?? 0,          color: '#27AE60',           border: '#27AE6022' },
  ];

  // Group by status for Kanban
  const kanbanGroups: Record<Status, any[]> = { new: [], contacted: [], shortlisted: [], hired: [], rejected: [] };
  filteredCandidates.forEach(c => {
    const s = (c.status || 'new') as Status;
    if (kanbanGroups[s]) kanbanGroups[s].push(c);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="zr-subheader-title">Candidate Pipeline</h1>
              <span className="zr-badge zr-badge-blue" style={{ fontSize: 10 }}>Groq AI Powered</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Multi-tier ATS matching scores, AI email outreach, and 5-stage recruitment pipeline
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/candidates/new">
              <button className="zr-btn zr-btn-orange zr-btn-sm">+ Add Candidate</button>
            </Link>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--zr-border)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'zr-btn zr-btn-blue zr-btn-xs' : 'zr-btn zr-btn-ghost zr-btn-xs'}
                style={{ borderRadius: 0, border: 'none' }}
                title="List View"
              ><IconList /></button>
              <button
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'zr-btn zr-btn-blue zr-btn-xs' : 'zr-btn zr-btn-ghost zr-btn-xs'}
                style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid var(--zr-border)' }}
                title="Kanban View"
              ><IconKanban /></button>
            </div>
          </div>
        </div>

        <div className="zr-content">
          {actionMsg && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
              {actionMsg}
            </div>
          )}

          {actionError && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
              ⚠ {actionError}
            </div>
          )}

          {/* Stat chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 16 }}>
            {statCards.map(s => (
              <div key={s.label} style={{
                background: 'var(--zr-white)',
                border: `1px solid ${s.border}`,
                borderLeft: `4px solid ${s.color}`,
                borderRadius: 8,
                padding: '12px 16px',
                boxShadow: 'var(--zr-shadow-sm)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ════════ ATS SCORE TIER FILTER BAR ════════ */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'top', label: '⭐ Top ATS Matches (80%+)' },
              { id: 'moderate', label: '📋 Moderate (60-79%)' },
              { id: 'low', label: '⚠️ Low Match (<60%)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAtsTierFilter(tab.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 16,
                  border: `1px solid ${atsTierFilter === tab.id ? 'var(--zr-blue)' : 'var(--zr-border)'}`,
                  background: atsTierFilter === tab.id ? 'var(--zr-blue-light)' : 'var(--zr-white)',
                  color: atsTierFilter === tab.id ? 'var(--zr-blue)' : 'var(--zr-text-2)',
                  fontSize: 12,
                  fontWeight: atsTierFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="zr-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search candidate name, email, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="zr-input"
              style={{ maxWidth: 380, fontSize: 13 }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="zr-input"
              style={{ maxWidth: 160, fontSize: 13 }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </div>

          {/* ════════ LIST VIEW ════════ */}
          {viewMode === 'list' && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>ATS Score</th>
                      <th>Applied Job</th>
                      <th>Skills &amp; Tags</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--zr-muted)' }}>
                          No candidates found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map(c => {
                        const meta = STATUS_META[(c.status || 'new') as Status] || STATUS_META.new;
                        const skills = parseSkills(c.skills);
                        const tags = parseSkills(c.tags);
                        const latestApp = c.applications?.[0];

                        return (
                          <tr key={c.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar name={`${c.firstName} ${c.lastName}`} />
                                <div>
                                  <Link href={`/candidates/${c.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>
                                      {c.firstName} {c.lastName}
                                    </div>
                                  </Link>
                                  <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                                    {c.email} {c.phone ? `· ${c.phone}` : ''}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <ScoreBadge score={c.score} />
                            </td>

                            <td>
                              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-blue)' }}>
                                {latestApp?.job?.title || 'General Talent'}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                                {skills.slice(0, 2).map((sk, i) => (
                                  <span key={i} className="zr-pill zr-pill-blue" style={{ fontSize: 10 }}>{sk}</span>
                                ))}
                                {tags.slice(0, 2).map((tg, i) => (
                                  <TagPill key={i} tag={tg} index={i} />
                                ))}
                              </div>
                            </td>

                            <td>
                              <select
                                value={c.status || 'new'}
                                disabled={updatingId === c.id}
                                onChange={e => handleStatusChange(c.id, e.target.value)}
                                style={{
                                  fontSize: 11, fontWeight: 600,
                                  border: `1px solid ${meta.border}`, borderRadius: 6,
                                  padding: '4px 8px', color: meta.color, background: meta.bg,
                                  cursor: 'pointer', outline: 'none',
                                }}
                              >
                                {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                              </select>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOpenEmailModal(c)}
                                  className="zr-btn zr-btn-purple zr-btn-xs"
                                  title="Draft AI Email"
                                >
                                  🤖 AI Email
                                </button>
                                <Link href={`/candidates/${c.id}`}>
                                  <button className="zr-btn zr-btn-outline zr-btn-xs">Profile</button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ KANBAN VIEW ════════ */}
          {viewMode === 'kanban' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(230px, 1fr))', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
              {STATUSES.map(status => {
                const meta = STATUS_META[status];
                const list = kanbanGroups[status];
                return (
                  <div key={status} style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 10, padding: 12, minHeight: 400 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <strong style={{ fontSize: 13, color: meta.color }}>{meta.label}</strong>
                      <span style={{ fontSize: 11, fontWeight: 700, background: meta.bg, color: meta.color, padding: '2px 7px', borderRadius: 10 }}>
                        {list.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {list.map(c => (
                        <div key={c.id} className="zr-card" style={{ padding: 12, boxShadow: 'var(--zr-shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <Link href={`/candidates/${c.id}`} style={{ textDecoration: 'none' }}>
                              <strong style={{ fontSize: 13, color: 'var(--zr-text)' }}>{c.firstName} {c.lastName}</strong>
                            </Link>
                            <ScoreBadge score={c.score} />
                          </div>

                          <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginBottom: 8 }}>
                            {c.email}
                          </div>

                          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', borderTop: '1px solid var(--zr-border-light)', paddingTop: 8 }}>
                            <button
                              onClick={() => handleOpenEmailModal(c)}
                              className="zr-btn zr-btn-purple zr-btn-xs"
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              🤖 AI Email
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ════════ AI EMAIL DRAFTER & CONFIRMATION MODAL ════════ */}
        {emailModalOpen && emailCandidate && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 620, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🤖 Groq AI Email Drafter &amp; HR Confirmation
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    To: <strong>{emailCandidate.firstName} {emailCandidate.lastName}</strong> ({emailCandidate.email})
                  </p>
                </div>
                <button
                  onClick={() => setEmailModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Email Template Selector */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  { id: 'interview_invitation', label: '🎯 Interview Invite' },
                  { id: 'application_ack', label: '📄 Application Received' },
                  { id: 'rejection', label: '🤝 Polite Rejection' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setEmailType(t.id as any);
                      handleGenerateDraft(emailCandidate, t.id as any);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: `1px solid ${emailType === t.id ? 'var(--zr-purple)' : 'var(--zr-border)'}`,
                      background: emailType === t.id ? 'var(--zr-purple-light)' : 'var(--zr-white)',
                      color: emailType === t.id ? 'var(--zr-purple)' : 'var(--zr-text-2)',
                      fontSize: 12,
                      fontWeight: emailType === t.id ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendEmailConfirmation}>
                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Email Subject *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    className="zr-input"
                    placeholder={generatingDraft ? 'Generating subject with AI...' : 'Subject'}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="zr-label" style={{ margin: 0 }}>
                      Email Message Body (Editable by HR) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDraft(emailCandidate, emailType)}
                      disabled={generatingDraft}
                      style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--zr-purple)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {generatingDraft ? '⚡ Regenerating...' : '🔄 Regenerate with Groq AI'}
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                    className="zr-input"
                    style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5 }}
                    placeholder={generatingDraft ? 'Groq Llama 3.3 is drafting your email...' : 'Email body'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                    ✓ Recorded automatically into candidate activity timeline upon sending
                  </span>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setEmailModalOpen(false)}
                      className="zr-btn zr-btn-ghost zr-btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dispatchingEmail || generatingDraft}
                      className="zr-btn zr-btn-orange zr-btn-sm"
                    >
                      {dispatchingEmail ? 'Sending...' : '✉️ Confirm & Send Email'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}