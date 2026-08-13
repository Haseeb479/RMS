'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useJob } from '@/lib/hooks/usejobs';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  draft: { bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)', label: 'Draft' },
  published: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)', label: 'Published' },
  closed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)', label: 'Closed' },
};

export default function JobDetailPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { job, loading, error } = useJob(id);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  const statusStyle = job ? (STATUS_COLORS[job.status] || STATUS_COLORS.draft) : STATUS_COLORS.draft;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/jobs">
              <span style={{ color: '#818cf8', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>← Jobs</span>
            </Link>
            <span style={{ color: '#64748b' }}>/</span>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>
              {job?.title || 'Job Detail'}
            </h1>
          </div>
          {job && (
            <span style={{
              padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
              fontWeight: '600', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`
            }}>
              {statusStyle.label}
            </span>
          )}
        </div>

        <div style={{ padding: '32px', maxWidth: '800px' }}>
          {loading && <div style={{ color: '#64748b', textAlign: 'center', padding: '48px' }}>Loading...</div>}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '16px', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          {job && (
            <>
              {/* Job Header Card */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px' }}>
                  {job.title}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                  {job.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 {job.location}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💼 {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                  </span>
                  {job.salary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      💰 {job.salary}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    👥 {job._count?.applications ?? 0} applicants
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🗓 Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '12px' }}>
                  Job Description
                </h3>
                <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '12px' }}>
                    Requirements
                  </h3>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link href="/jobs">
                  <button style={{
                    padding: '10px 20px', background: '#1e293b', color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                  }}>
                    ← Back to Jobs
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
