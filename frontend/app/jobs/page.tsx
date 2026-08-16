'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useJobs, Job } from '@/lib/hooks/usejobs';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { cls: string; label: string }> = {
  draft:     { cls: 'zr-badge zr-badge-gray',   label: 'Draft' },
  published: { cls: 'zr-badge zr-badge-green',  label: 'Live' },
  closed:    { cls: 'zr-badge zr-badge-red',    label: 'Closed' },
};

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract':  'Contract',
  'remote':    'Remote',
};

interface JobFormData {
  title: string; description: string; location: string; type: string;
  salary: string; requirements: string;
  publishPortal: boolean; publishLinkedIn: boolean; publishIndeed: boolean; publishGoogle: boolean;
}

const EMPTY_FORM: JobFormData = {
  title: '', description: '', location: '', type: 'full-time', salary: '', requirements: '',
  publishPortal: true, publishLinkedIn: true, publishIndeed: true, publishGoogle: true,
};

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function JobsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { jobs, loading, error, createJob, updateJob, deleteJob, publishJob, closeJob } = useJobs(statusFilter);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [publishedJobResult, setPublishedJobResult] = useState<any | null>(null);
  const [publishingStep, setPublishingStep] = useState<number>(0);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const openCreate = () => { setEditingJob(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({ title: job.title, description: job.description, location: job.location || '', type: job.type, salary: job.salary || '', requirements: job.requirements || '', publishPortal: true, publishLinkedIn: true, publishIndeed: true, publishGoogle: true });
    setFormError(''); setShowModal(true);
  };

  const runPublishingAnimation = async (jobData: any) => {
    setPublishedJobResult(jobData); setShowPublishModal(true);
    for (let i = 1; i <= 5; i++) {
      setPublishingStep(i);
      await new Promise(r => setTimeout(r, i === 5 ? 0 : 650));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError('');
    try {
      if (editingJob) {
        const updated = await updateJob(editingJob.id, form);
        setShowModal(false);
        if (updated.status === 'published') runPublishingAnimation(updated);
      } else {
        const created = await createJob(form);
        const published = await publishJob(created.id);
        setShowModal(false);
        runPublishingAnimation(published);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save job');
    } finally { setSaving(false); }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id + '-publish');
    try { const p = await publishJob(id); runPublishingAnimation(p); } catch (err: any) { alert(err.message || 'Failed to publish'); }
    setActionLoading(null);
  };
  const handleClose = async (id: string) => {
    setActionLoading(id + '-close');
    try { await closeJob(id); } catch { } setActionLoading(null);
  };
  const handleDelete = async (id: string) => {
    setActionLoading(id + '-delete');
    try { await deleteJob(id); } catch { } setActionLoading(null); setConfirmDelete(null);
  };
  const copyText = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text); setFn(true); setTimeout(() => setFn(false), 2000);
  };

  const filters = [
    { label: 'All Jobs', value: undefined },
    { label: 'Live', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Closed', value: 'closed' },
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiBase = origin.replace(':3000', ':5000');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Job Openings</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Post and distribute jobs across company portal, LinkedIn, Indeed, and Google for Jobs
            </p>
          </div>
          <button onClick={openCreate} className="zr-btn zr-btn-primary zr-btn-sm">
            <PlusIcon /> Post & Distribute Job
          </button>
        </div>

        <div className="zr-content">

          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {filters.map(f => (
              <button
                key={String(f.value)}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: statusFilter === f.value ? 'var(--zr-orange)' : 'var(--zr-white)',
                  color: statusFilter === f.value ? '#fff' : 'var(--zr-muted)',
                  border: `1px solid ${statusFilter === f.value ? 'var(--zr-orange)' : 'var(--zr-border)'}`,
                  boxShadow: statusFilter === f.value ? '0 2px 8px rgba(232,101,42,0.25)' : 'var(--zr-shadow-sm)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--zr-danger)', fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--zr-muted)', fontSize: 13 }}>Loading job openings...</div>
          )}

          {!loading && jobs.length === 0 && (
            <div className="zr-empty">
              <div className="zr-empty-icon">💼</div>
              <div className="zr-empty-title">No job openings yet</div>
              <div className="zr-empty-desc">Post your first job to start attracting candidates across all platforms.</div>
              <button onClick={openCreate} className="zr-btn zr-btn-primary zr-btn-sm">
                <PlusIcon /> Post First Job
              </button>
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <table className="zr-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => {
                    const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
                    const appCount = job._count?.applications ?? 0;
                    return (
                      <tr key={job.id}>
                        <td>
                          <div>
                            <Link href={`/jobs/${job.id}`}>
                              <span style={{ fontWeight: 600, color: 'var(--zr-blue)', fontSize: 13, cursor: 'pointer' }}>
                                {job.title}
                              </span>
                            </Link>
                            {job.status === 'published' && (
                              <span className="zr-badge zr-badge-green" style={{ marginLeft: 8, fontSize: 10 }}>
                                🌐 Live
                              </span>
                            )}
                            {job.salary && (
                              <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 2 }}>
                                {job.salary}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--zr-muted)', fontSize: 12 }}>
                            <BriefcaseIcon />
                            {TYPE_LABELS[job.type] || job.type}
                          </div>
                        </td>
                        <td>
                          {job.location ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--zr-text-2)', fontSize: 12 }}>
                              <LocationIcon />
                              {job.location}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--zr-muted-light)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--zr-text)', fontSize: 13 }}>
                            <UsersIcon />
                            {appCount}
                          </div>
                        </td>
                        <td>
                          <span className={statusCfg.cls}>{statusCfg.label}</span>
                        </td>
                        <td style={{ color: 'var(--zr-muted)', fontSize: 12 }}>
                          {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {job.status === 'draft' && (
                              <button
                                onClick={() => handlePublish(job.id)}
                                disabled={actionLoading === job.id + '-publish'}
                                className="zr-btn zr-btn-sm"
                                style={{ background: 'var(--zr-success)', color: '#fff', border: 'none', fontSize: 12 }}
                              >
                                {actionLoading === job.id + '-publish' ? '...' : 'Publish'}
                              </button>
                            )}
                            {job.status === 'published' && (
                              <button
                                onClick={() => handleClose(job.id)}
                                disabled={actionLoading === job.id + '-close'}
                                className="zr-btn zr-btn-outline zr-btn-xs"
                              >
                                {actionLoading === job.id + '-close' ? '...' : 'Close'}
                              </button>
                            )}
                            <button onClick={() => openEdit(job)} className="zr-btn zr-btn-ghost zr-btn-xs">
                              <EditIcon />
                            </button>
                            <button onClick={() => setConfirmDelete(job.id)} className="zr-btn zr-btn-danger-ghost zr-btn-xs">
                              <TrashIcon />
                            </button>
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="zr-modal-overlay">
          <div className="zr-modal">
            <div className="zr-modal-header">
              <div>
                <div className="zr-modal-title">
                  {editingJob ? 'Edit Job Opening' : 'Post & Distribute Job'}
                </div>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 3 }}>
                  Publish simultaneously across Company Portal · LinkedIn · Indeed · Google for Jobs
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zr-muted)', padding: 4 }}
              >
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

                {/* Distribution channels */}
                <div style={{ background: 'var(--zr-orange-light)', border: '1px solid rgba(232,101,42,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--zr-orange)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>
                    Distribution Channels
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { key: 'publishPortal',   label: '🌐 Company Careers Portal' },
                      { key: 'publishLinkedIn', label: '💼 LinkedIn Jobs' },
                      { key: 'publishIndeed',   label: '📋 Indeed XML Feed' },
                      { key: 'publishGoogle',   label: '🔍 Google for Jobs' },
                    ].map(ch => (
                      <label key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--zr-text-2)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(form as any)[ch.key]}
                          onChange={e => setForm(p => ({ ...p, [ch.key]: e.target.checked }))}
                          style={{ accentColor: 'var(--zr-orange)', width: 14, height: 14 }}
                        />
                        {ch.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Job Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Senior Full-Stack Engineer" required className="zr-input" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="zr-form-group">
                    <label className="zr-label">Employment Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="zr-input">
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div className="zr-form-group">
                    <label className="zr-label">Location</label>
                    <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. New York, NY or Remote" className="zr-input" />
                  </div>
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Salary Range</label>
                  <input type="text" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                    placeholder="e.g. $110,000 – $140,000 / year" className="zr-input" />
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Job Description *</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe key responsibilities and impact..." required
                    className="zr-input" style={{ minHeight: 100, resize: 'vertical' }} />
                </div>

                <div className="zr-form-group" style={{ marginBottom: 0 }}>
                  <label className="zr-label">Requirements & Qualifications</label>
                  <textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
                    placeholder="List required skills and experience..."
                    className="zr-input" style={{ minHeight: 80, resize: 'vertical' }} />
                </div>
              </div>
              <div className="zr-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="zr-btn zr-btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="zr-btn zr-btn-primary" style={{ opacity: saving ? 0.65 : 1 }}>
                  {saving ? 'Publishing...' : '🚀 Publish & Distribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Publishing Success Modal ── */}
      {showPublishModal && publishedJobResult && (
        <div className="zr-modal-overlay" style={{ zIndex: 2100 }}>
          <div className="zr-modal" style={{ maxWidth: 640 }}>
            <div className="zr-modal-header">
              <div className="zr-modal-title">
                {publishingStep < 5 ? 'Publishing in progress...' : '🎉 Job Successfully Published!'}
              </div>
              {publishingStep >= 5 && (
                <button onClick={() => setShowPublishModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zr-muted)', padding: 4 }}>
                  <CloseIcon />
                </button>
              )}
            </div>
            <div className="zr-modal-body">
              {publishingStep < 5 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
                  <p style={{ color: 'var(--zr-muted)', fontSize: 13, marginBottom: 24 }}>
                    Distributing <strong style={{ color: 'var(--zr-text)' }}>{publishedJobResult.title}</strong> across all networks...
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, margin: '0 auto', textAlign: 'left' }}>
                    {[
                      'Generating Job Code & Portal URL',
                      'Publishing to Company Careers Portal',
                      'Syndicating to LinkedIn Job Network',
                      'Updating Indeed XML Aggregator Feed',
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: publishingStep > i ? 'var(--zr-success)' : 'var(--zr-muted)' }}>
                        {publishingStep > i
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                        }
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'var(--zr-success-light)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--zr-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-success)' }}>
                      Broadcasting across 4 distribution networks — JOB-{publishedJobResult.jobCode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="zr-label">Direct Candidate Portal Link</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" readOnly value={`${origin}/apply/${publishedJobResult.id}`} className="zr-input" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--zr-blue)', flex: 1 }} />
                        <button onClick={() => copyText(`${origin}/apply/${publishedJobResult.id}`, setCopiedLink)}
                          className={`zr-btn zr-btn-sm ${copiedLink ? '' : 'zr-btn-primary'}`}
                          style={{ background: copiedLink ? 'var(--zr-success)' : undefined, border: 'none', color: '#fff', flexShrink: 0 }}>
                          {copiedLink ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="zr-label">Indeed XML Feed URL</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" readOnly value={`${apiBase}/public/feeds/indeed/demo-tech.xml`} className="zr-input" style={{ fontFamily: 'monospace', fontSize: 12, flex: 1 }} />
                        <button onClick={() => copyText(`${apiBase}/public/feeds/indeed/demo-tech.xml`, setCopiedFeed)}
                          className="zr-btn zr-btn-blue zr-btn-sm"
                          style={{ background: copiedFeed ? 'var(--zr-success)' : undefined, border: 'none', color: '#fff', flexShrink: 0 }}>
                          {copiedFeed ? '✓ Copied' : 'Copy XML'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {publishingStep >= 5 && (
              <div className="zr-modal-footer">
                <a href={`${origin}/apply/${publishedJobResult.id}`} target="_blank" rel="noopener noreferrer">
                  <button className="zr-btn zr-btn-outline">View Portal ↗</button>
                </a>
                <button onClick={() => setShowPublishModal(false)} className="zr-btn zr-btn-primary">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <div className="zr-modal-overlay" style={{ zIndex: 2200 }}>
          <div className="zr-modal" style={{ maxWidth: 400 }}>
            <div className="zr-modal-header">
              <div className="zr-modal-title">Delete Job Opening?</div>
            </div>
            <div className="zr-modal-body">
              <p style={{ fontSize: 13, color: 'var(--zr-muted)' }}>
                This action cannot be undone. All associated applications will also be removed.
              </p>
            </div>
            <div className="zr-modal-footer">
              <button onClick={() => setConfirmDelete(null)} className="zr-btn zr-btn-outline">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={!!actionLoading}
                className="zr-btn"
                style={{ background: 'var(--zr-danger)', color: '#fff', border: 'none', opacity: actionLoading ? 0.65 : 1 }}>
                {actionLoading ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
