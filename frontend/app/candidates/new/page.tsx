'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

export default function ManualCandidateNoticePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Candidate Sourcing & Intake</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Automatic portal intake workflow
            </p>
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: '680px', margin: '20px auto 0 auto' }}>
          <div className="zr-card" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--zr-blue-light)',
              color: 'var(--zr-blue)',
              fontSize: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              🌐
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '8px' }}>
              Automated Candidate Portal Intake
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--zr-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Candidates apply directly through your organization&apos;s online careers portal. All candidate profile details, contact information, and parsed CV files are automatically registered and organized in your Candidate Directory.
            </p>

            <div style={{
              background: 'var(--zr-bg)',
              border: '1px solid var(--zr-border)',
              borderRadius: 'var(--zr-radius)',
              padding: '18px 20px',
              marginBottom: '28px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '8px' }}>
                💡 How Applications Enter Your Pipeline:
              </div>
              <ul style={{ fontSize: '12px', color: 'var(--zr-text-2)', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Candidates browse active job postings on your public Careers Page.</li>
                <li>They submit contact details and upload their CV document.</li>
                <li>The system parses their resume and creates their candidate record.</li>
                <li>Their application appears immediately in your pipeline board.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link href="/candidates">
                <button className="zr-btn zr-btn-outline">
                  ← Candidates Directory
                </button>
              </Link>
              <Link href="/careers/demo-tech" target="_blank">
                <button className="zr-btn zr-btn-primary">
                  🌐 Open Public Portal ↗
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}