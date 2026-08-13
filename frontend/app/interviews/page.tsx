'use client';

import Sidebar from '@/components/sidebar';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InterviewsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        <div style={{
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>Interviews</h1>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎥</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
              Interview Schedule
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '440px', margin: '0 auto' }}>
              Schedule, conduct, and manage candidate video interviews and feedback here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
