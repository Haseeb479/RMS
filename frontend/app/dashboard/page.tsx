'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import { useJobStats, useJobs } from '@/lib/hooks/usejobs';
import { useCandidates } from '@/lib/hooks/usecandidates';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const { company } = useCompany();
  const { stats: jobStats } = useJobStats();
  const { jobs, loading: jobsLoading } = useJobs();
  const { candidates, fetchCandidates, fetchStats, stats: candidateStats, loading: candidatesLoading } = useCandidates();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchCandidates();
      fetchStats();
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  const totalJobs = jobStats?.total ?? jobs.length;
  const publishedJobs = jobStats?.published ?? jobs.filter(j => j.status === 'published').length;
  const totalCandidates = candidateStats?.total ?? candidates.length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, width: '100%', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Dashboard Overview
            </h1>
            <span style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontWeight: '600',
            }}>
              Live
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/jobs">
              <button style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                + Post Job
              </button>
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px 4px 4px',
              background: '#1e293b',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: 'white',
              }}>
                A
              </div>
              <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '500' }}>
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '36px' }}>
          {/* Welcome Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
          }}>
            {/* Background Mesh Glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '260px',
              height: '260px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {company?.name ? `${company.name} Talent Control` : 'RMS Hiring Suite'}
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  Welcome back, Admin 👋
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '520px', lineHeight: '1.6' }}>
                  Here is what's happening across your recruitment funnel today. You have <strong style={{ color: '#818cf8' }}>{publishedJobs} active job{publishedJobs !== 1 ? 's' : ''}</strong> and <strong style={{ color: '#c084fc' }}>{totalCandidates} candidate{totalCandidates !== 1 ? 's' : ''}</strong> in your talent database.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/candidates">
                  <button style={{
                    padding: '11px 20px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}>
                    👥 Talent Pool
                  </button>
                </Link>
                <Link href="/jobs">
                  <button style={{
                    padding: '11px 20px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                  }}>
                    📋 Manage Jobs →
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Key Metrics Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            {/* Active Jobs Stat */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Active Openings
                </span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                  📋
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#f8fafc' }}>
                  {publishedJobs}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  / {totalJobs} total
                </span>
              </div>
              {/* Visual Spark Bar */}
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${totalJobs > 0 ? (publishedJobs / totalJobs) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {jobStats?.draft ?? 0} drafts • {jobStats?.closed ?? 0} closed
              </p>
            </div>

            {/* Total Candidates Stat */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Total Candidates
                </span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                  👥
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#f8fafc' }}>
                  {totalCandidates}
                </span>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                  ↑ Active pool
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(totalCandidates * 10, 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {candidateStats?.byStatus?.new ?? 0} new • {candidateStats?.byStatus?.shortlisted ?? 0} shortlisted
              </p>
            </div>

            {/* Applications Pipeline Stat */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Applications
                </span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                  📊
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#f8fafc' }}>
                  {jobs.reduce((acc, j) => acc + (j._count?.applications ?? 0), 0)}
                </span>
                <span style={{ fontSize: '12px', color: '#a5b4fc', fontWeight: '600' }}>
                  Received
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: '65%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                Across all active job posts
              </p>
            </div>

            {/* Interviews Scheduled Stat */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Interviews
                </span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                  🎥
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: '#f8fafc' }}>
                  0
                </span>
                <span style={{ fontSize: '12px', color: '#f472b6', fontWeight: '600' }}>
                  Upcoming
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: '35%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #ec4899, #f472b6)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                Scheduled for this week
              </p>
            </div>
          </div>

          {/* Main 2-Column Section: Active Jobs & Candidate Pipeline */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Left: Recent Active Jobs */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                  📋 Recent Job Postings
                </h3>
                <Link href="/jobs">
                  <span style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}>
                    View all ({jobs.length}) →
                  </span>
                </Link>
              </div>

              {jobsLoading ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', background: '#1e293b', borderRadius: '12px', border: '1px border rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '28px', marginBottom: '8px' }}>📝</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>No jobs posted yet</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Create your first opening to attract candidates</p>
                  <Link href="/jobs">
                    <button style={{
                      padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                    }}>
                      + Create Job
                    </button>
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {jobs.slice(0, 4).map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                              {job.title}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                              background: job.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: job.status === 'published' ? '#34d399' : '#cbd5e1',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                              {job.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {job.location ? `📍 ${job.location} • ` : ''}{job.type} {job.salary ? `• 💰 ${job.salary}` : ''}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#818cf8', display: 'block' }}>
                            {job._count?.applications ?? 0}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>applicants</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Candidate Talent Funnel */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                  🎯 Candidate Pipeline Breakdowns
                </h3>
                <Link href="/candidates">
                  <span style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}>
                    Manage candidates →
                  </span>
                </Link>
              </div>

              {/* Status Breakdown Meters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'New Applicants', key: 'new', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.2)' },
                  { label: 'Contacted', key: 'contacted', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
                  { label: 'Shortlisted', key: 'shortlisted', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
                  { label: 'Hired', key: 'hired', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
                  { label: 'Rejected', key: 'rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' },
                ].map((item) => {
                  const count = candidateStats?.byStatus?.[item.key] ?? 0;
                  const pct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                  return (
                    <div key={item.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{item.label}</span>
                        <span style={{ color: '#f8fafc', fontWeight: '700' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ background: '#1e293b', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: '6px',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Recent Candidates & Quick Links */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                👥 Recent Talent Additions
              </h3>
              <Link href="/candidates">
                <button style={{
                  padding: '7px 14px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                }}>
                  + Add Candidate
                </button>
              </Link>
            </div>

            {candidatesLoading ? (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>Loading candidates...</p>
            ) : candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', background: '#1e293b', borderRadius: '12px' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>👤</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>No candidates added yet</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Upload resumes or manually add candidates to build your pool</p>
                <Link href="/candidates">
                  <button style={{
                    padding: '8px 16px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}>
                    + Add First Candidate
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {candidates.slice(0, 4).map((c: any) => (
                  <Link key={c.id} href={`/candidates/${c.id}`}>
                    <div style={{
                      background: '#1e293b',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0,
                      }}>
                        {c.firstName?.[0] || 'C'}{c.lastName?.[0] || ''}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.firstName} {c.lastName}
                        </p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.email}
                        </p>
                      </div>
                      <span style={{
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                        background: c.status === 'hired' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: c.status === 'hired' ? '#34d399' : '#818cf8',
                        flexShrink: 0,
                      }}>
                        {c.status || 'new'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}