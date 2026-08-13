'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: '#090d16', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <div style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '18px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '15px',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}>
            RMS
          </div>
          <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '18px', letterSpacing: '0.5px' }}>RMS</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/auth/login">
            <button style={{
              padding: '9px 18px',
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#94a3b8',
            }}>
              Sign in
            </button>
          </Link>
          <Link href="/auth/signup">
            <button style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            }}>
              Get started
            </button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            ⚡ Modern Recruitment Platform
          </div>

          <h1 style={{
            fontSize: '52px',
            fontWeight: '800',
            color: '#f8fafc',
            marginBottom: '20px',
            lineHeight: '1.15',
            letterSpacing: '-1px',
          }}>
            Recruitment made <span style={{
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>effortless & fast</span>
          </h1>
          <p style={{
            fontSize: '17px',
            color: '#94a3b8',
            marginBottom: '36px',
            lineHeight: '1.6',
          }}>
            Manage jobs, parse candidate resumes, track applicant pipelines, and schedule interviews in one powerful dark-themed platform.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link href="/auth/signup">
              <button style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              }}>
                Start for free →
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={{
                padding: '14px 28px',
                background: '#0f172a',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
              }}>
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}