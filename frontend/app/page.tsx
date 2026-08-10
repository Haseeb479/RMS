'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e3',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
          }}>
            RMS
          </div>
          <span style={{ fontWeight: '600', color: '#1a1a1a' }}>RMS</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/auth/login">
            <button style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666',
            }}>
              Sign in
            </button>
          </Link>
          <Link href="/auth/signup">
            <button style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
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
        padding: '60px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#1a1a1a',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Recruitment made simple
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}>
            Manage jobs, candidates, and interviews in one clean, minimal platform. Everything you need to hire great people.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/auth/signup">
              <button style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}>
                Start for free
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#666',
                border: '1px solid #e5e5e3',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
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