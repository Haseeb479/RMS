'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useJob } from '@/lib/hooks/usejobs';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: '#f5f5f4', color: '#78716c', label: 'Draft' },
  published: { bg: '#ecfdf5', color: '#047857', label: 'Published' },
  closed: { bg: '#fef2f2', color: '#991b1b', label: 'Closed' },
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

  if (!isLoggedIn) return <div>Loading...</div>;

  const statusStyle = job ? (STATUS_COLORS[job.status] || STATUS_COLORS.draft) : STATUS_COLORS.draft;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf8' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e5e5e3', padding: '16px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/jobs">
              <span style={{ color: '#3b82f6', cursor: 'pointer', fontSize: '14px' }}>← Jobs</span>
            </Link>
            <span style={{ color: '#e5e5e3' }}>/</span>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
              {job?.title || 'Job Detail'}
            </h1>
          </div>
          {job && (
            <span style={{
              padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
              fontWeight: '600', background: statusStyle.bg, color: statusStyle.color,
            }}>
              {statusStyle.label}
            </span>
          )}
        </div>

        <div style={{ padding: '32px', maxWidth: '800px' }}>
          {loading && <div style={{ color: '#999', textAlign: 'center', padding: '48px' }}>Loading...</div>}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#991b1b' }}>
              ⚠️ {error}
            </div>
          )}

          {job && (
            <>
              {/* Job Header Card */}
              <div style={{ background: 'white', border: '1px solid #e5e5e3', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>
                  {job.title}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#666', marginBottom: '16px' }}>
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
              <div style={{ background: 'white', border: '1px solid #e5e5e3', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  Job Description
                </h3>
                <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div style={{ background: 'white', border: '1px solid #e5e5e3', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                    Requirements
                  </h3>
                  <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link href="/jobs">
                  <button style={{
                    padding: '10px 20px', background: 'white', color: '#666',
                    border: '1px solid #e5e5e3', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
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
