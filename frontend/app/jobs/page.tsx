'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useJobs, Job } from '@/lib/hooks/usejobs';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  draft: { bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', label: 'Draft' },
  published: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)', label: 'Published' },
  closed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)', label: 'Closed' },
};

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'remote': 'Remote',
};

interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  requirements: string;
}

const EMPTY_FORM: JobFormData = {
  title: '',
  description: '',
  location: '',
  type: 'full-time',
  salary: '',
  requirements: '',
};

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

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  const openCreate = () => {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location || '',
      type: job.type,
      salary: job.salary || '',
      requirements: job.requirements || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingJob) {
        await updateJob(editingJob.id, form);
      } else {
        await createJob(form);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id + '-publish');
    try { await publishJob(id); } catch { }
    setActionLoading(null);
  };

  const handleClose = async (id: string) => {
    setActionLoading(id + '-close');
    try { await closeJob(id); } catch { }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id + '-delete');
    try { await deleteJob(id); } catch { }
    setActionLoading(null);
    setConfirmDelete(null);
  };

  const filters = [
    { label: 'All', value: undefined },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>Jobs</h1>
          <button
            onClick={openCreate}
            style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}
          >
            + Post Job
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Job Postings
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Create and manage your open positions</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {filters.map(f => (
              <button
                key={String(f.value)}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: statusFilter === f.value ? '#818cf8' : 'rgba(255,255,255,0.1)',
                  background: statusFilter === f.value ? 'rgba(99, 102, 241, 0.2)' : '#0f172a',
                  color: statusFilter === f.value ? '#818cf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
              Loading jobs...
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div style={{
              background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
              padding: '64px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>
                No jobs yet
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                Post your first job opening to start attracting candidates.
              </p>
              <button
                onClick={openCreate}
                style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                }}
              >
                + Post Your First Job
              </button>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && jobs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs.map(job => {
                const statusStyle = STATUS_COLORS[job.status] || STATUS_COLORS.draft;
                const appCount = job._count?.applications ?? 0;
                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Link href={`/jobs/${job.id}`}>
                          <span style={{
                            fontSize: '16px', fontWeight: '600', color: '#f8fafc',
                            cursor: 'pointer', textDecoration: 'none',
                          }}>
                            {job.title}
                          </span>
                        </Link>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                          fontWeight: '600', background: statusStyle.bg, color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                        }}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#94a3b8' }}>
                        {job.location && <span>📍 {job.location}</span>}
                        <span>💼 {TYPE_LABELS[job.type] || job.type}</span>
                        {job.salary && <span>💰 {job.salary}</span>}
                        <span>👥 {appCount} applicant{appCount !== 1 ? 's' : ''}</span>
                        <span>🗓 {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {job.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(job.id)}
                          disabled={actionLoading === job.id + '-publish'}
                          style={{
                            padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '500',
                          }}
                        >
                          {actionLoading === job.id + '-publish' ? '...' : '✅ Publish'}
                        </button>
                      )}
                      {job.status === 'published' && (
                        <button
                          onClick={() => handleClose(job.id)}
                          disabled={actionLoading === job.id + '-close'}
                          style={{
                            padding: '6px 14px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15',
                            border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '6px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '500',
                          }}
                        >
                          {actionLoading === job.id + '-close' ? '...' : '🔒 Close'}
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(job)}
                        style={{
                          padding: '6px 14px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc',
                          border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '500',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(job.id)}
                        style={{
                          padding: '6px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '500',
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px',
        }}>
          <div style={{
            background: '#0f172a', borderRadius: '12px', width: '100%',
            maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc' }}>
                {editingJob ? 'Edit Job' : 'Post a New Job'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >×</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px',
                  padding: '10px 14px', color: '#f87171', fontSize: '13px',
                }}>
                  ⚠️ {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
                />
              </div>

              {/* Type & Location row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                    Job Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc' }}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. New York, NY or Remote"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Salary */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  value={form.salary}
                  onChange={e => setForm(p => ({ ...p, salary: e.target.value }))}
                  placeholder="e.g. $80,000 – $100,000 / year"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                  Job Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the role, responsibilities, and what success looks like..."
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Requirements */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px', color: '#cbd5e1' }}>
                  Requirements (Optional)
                </label>
                <textarea
                  value={form.requirements}
                  onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))}
                  placeholder="List skills, experience, and qualifications..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', fontSize: '14px', background: '#1e293b', color: '#f8fafc', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', background: '#1e293b', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: '600', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {saving ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001,
        }}>
          <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#f8fafc', marginBottom: '10px' }}>
              Delete Job?
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              This action cannot be undone. All associated applications will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ padding: '8px 18px', background: '#1e293b', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!actionLoading}
                style={{ padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                {actionLoading ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
