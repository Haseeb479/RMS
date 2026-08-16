'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: '#F0F2F7', color: '#101828', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>

      {/* Top Navigation */}
      <nav style={{
        background: '#1A223D',
        padding: '16px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--zr-orange)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '18px',
          }}>
            R
          </div>
          <div>
            <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '18px', letterSpacing: '-0.3px' }}>
              RMS Recruit
            </span>
            <span style={{ fontSize: '11px', color: '#FFB28A', marginLeft: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Enterprise Edition
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/auth/login">
            <button style={{
              padding: '8px 18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              transition: 'background 0.15s',
            }}>
              Sign In
            </button>
          </Link>
          <Link href="/auth/signup">
            <button style={{
              padding: '8px 18px',
              background: 'var(--zr-orange)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(232, 101, 42, 0.35)',
            }}>
              Get Started Free →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'var(--zr-orange-light)',
            border: '1px solid rgba(232, 101, 42, 0.25)',
            color: 'var(--zr-orange)',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}>
            <span>⚡</span> Complete Recruitment Automation Suite
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: '800',
            color: '#1A223D',
            marginBottom: '16px',
            lineHeight: '1.2',
            letterSpacing: '-0.8px',
          }}>
            Source, Evaluate, and Hire Top Talent with Speed & Precision
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#667085',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '620px',
            margin: '0 auto 32px',
          }}>
            An all-in-one recruitment management system featuring multi-channel job syndication, automated resume inbox extraction, drag-and-drop Kanban pipelines, interview scheduling, and e-signature offer letters.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <Link href="/dashboard">
              <button style={{
                padding: '14px 28px',
                background: 'var(--zr-orange)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                boxShadow: '0 4px 14px rgba(232, 101, 42, 0.35)',
              }}>
                Launch Recruiter Workspace →
              </button>
            </Link>
            <Link href="/auth/login">
              <button style={{
                padding: '14px 24px',
                background: '#FFFFFF',
                border: '1px solid #DDE1EC',
                color: '#1A223D',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}>
                Sign In to Account
              </button>
            </Link>
          </div>

          {/* Module Feature Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            textAlign: 'left',
          }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DDE1EC',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📬</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D', margin: '0 0 4px 0' }}>Resume Inbox</h3>
              <p style={{ fontSize: '12px', color: '#667085', margin: 0, lineHeight: '1.5' }}>
                Auto-ingest and parse CVs from email and webhooks with automatic skill extraction.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DDE1EC',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D', margin: '0 0 4px 0' }}>Career Site Builder</h3>
              <p style={{ fontSize: '12px', color: '#667085', margin: 0, lineHeight: '1.5' }}>
                Custom company branding, hero banner styles, perks, and responsive candidate portals.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DDE1EC',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D', margin: '0 0 4px 0' }}>Job Board Syndication</h3>
              <p style={{ fontSize: '12px', color: '#667085', margin: 0, lineHeight: '1.5' }}>
                Indeed XML, ZipRecruiter XML, Google for Jobs JSON-LD, and UTM tracking links.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DDE1EC',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✍️</div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D', margin: '0 0 4px 0' }}>Offer Letters & E-Sign</h3>
              <p style={{ fontSize: '12px', color: '#667085', margin: 0, lineHeight: '1.5' }}>
                Generate official offer letters and capture candidate acceptance with e-signatures.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #DDE1EC',
        padding: '24px 36px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#667085',
      }}>
        © {new Date().getFullYear()} RMS Recruit. Powered by Enterprise Recruitment Automation.
      </footer>
    </div>
  );
}