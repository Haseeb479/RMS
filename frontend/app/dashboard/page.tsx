'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import { useJobs } from '@/lib/hooks/usejobs';
import { useAnalytics, FunnelStage, ActivityItem, TopJob } from '@/lib/hooks/useanalytics';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const { company } = useCompany();
  const { jobs } = useJobs();
  const { data: analytics, loading, error, fetchAnalytics } = useAnalytics();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchAnalytics(selectedJobId || undefined);
    }
  }, [isLoggedIn, router, selectedJobId, fetchAnalytics]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>
        Loading authentication...
      </div>
    );
  }

  const quickStats = analytics?.quickStats;
  const funnel = analytics?.funnel || [];
  const topJobs = analytics?.topJobs || [];
  const activities = analytics?.recentActivities || [];

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'candidate':
        return '👤';
      case 'application':
        return '📄';
      case 'interview':
        return '🎥';
      case 'job':
        return '📋';
      default:
        return '⚡';
    }
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'hired':
      case 'published':
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'interview':
      case 'scheduled':
      case 'shortlisted':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'screening':
      case 'contacted':
      case 'applied':
      case 'rescheduled':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'cancelled':
      case 'rejected':
      case 'closed':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, width: '100%', minWidth: 0 }}>
        {/* Top Header Bar */}
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
              Dashboard & Analytics
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
              Module 9
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Filter by Job */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Filter Job:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">All Job Positions</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>

        {/* Page Body */}
        <div style={{ padding: '36px' }}>
          {/* Welcome Banner Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
          }}>
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
                    {company?.name ? `${company.name} Hiring Intelligence` : 'RMS Recruitment Suite'}
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  Talent Acquisition & Analytics
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '560px', lineHeight: '1.6' }}>
                  Real-time visibility across your hiring funnel. You have{' '}
                  <strong style={{ color: '#818cf8' }}>{quickStats?.publishedJobs ?? 0} active openings</strong>,{' '}
                  <strong style={{ color: '#c084fc' }}>{quickStats?.totalCandidates ?? 0} candidates</strong>, and a hiring conversion rate of{' '}
                  <strong style={{ color: '#34d399' }}>{quickStats?.conversionRate ?? 0}%</strong>.
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
                  }}>
                    👥 Talent Pool
                  </button>
                </Link>
                <Link href="/applications">
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
                    📊 Pipeline Board →
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            {/* Active Jobs */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
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
                  {loading ? '...' : (quickStats?.publishedJobs ?? 0)}
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  / {quickStats?.totalJobs ?? 0} total
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(quickStats?.totalJobs ?? 0) > 0 ? ((quickStats?.publishedJobs ?? 0) / quickStats!.totalJobs) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {quickStats?.draftJobs ?? 0} drafts • {quickStats?.closedJobs ?? 0} closed
              </p>
            </div>

            {/* Total Candidates */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Talent Database
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
                  {loading ? '...' : (quickStats?.totalCandidates ?? 0)}
                </span>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                  {quickStats?.candidateStats?.hired ?? 0} Hired
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((quickStats?.totalCandidates ?? 0) * 10, 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {quickStats?.candidateStats?.new ?? 0} new • {quickStats?.candidateStats?.shortlisted ?? 0} shortlisted
              </p>
            </div>

            {/* Total Applications */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
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
                  {loading ? '...' : (quickStats?.totalApplications ?? 0)}
                </span>
                <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                  {quickStats?.conversionRate ?? 0}% Win Rate
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(quickStats?.conversionRate ?? 0, 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {quickStats?.applicationStats?.interview ?? 0} in interview stage
              </p>
            </div>

            {/* Interviews Scheduled */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '24px',
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
                  {loading ? '...' : (quickStats?.interviewStats?.scheduled ?? 0)}
                </span>
                <span style={{ fontSize: '12px', color: '#f472b6', fontWeight: '600' }}>
                  Scheduled
                </span>
              </div>
              <div style={{ marginTop: '16px', background: '#1e293b', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(quickStats?.totalInterviews ?? 0) > 0 ? ((quickStats?.interviewStats?.scheduled ?? 0) / quickStats!.totalInterviews) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ec4899, #f472b6)',
                  borderRadius: '4px',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                {quickStats?.interviewStats?.completed ?? 0} completed • {quickStats?.interviewStats?.cancelled ?? 0} cancelled
              </p>
            </div>
          </div>

          {/* Section 1: Interactive Hiring Funnel Chart */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                  🎯 Hiring Funnel Conversion
                </h3>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Candidate progression and conversion rate across hiring stages
                </p>
              </div>
              <div style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                Overall Conversion: {quickStats?.conversionRate ?? 0}%
              </div>
            </div>

            {loading ? (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '36px' }}>Loading funnel data...</p>
            ) : funnel.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '36px' }}>No application data available yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {funnel.map((stageItem: FunnelStage, idx: number) => {
                  const widthPct = Math.max(stageItem.percentage, 6);
                  return (
                    <div key={stageItem.stage} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: stageItem.color,
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: '600', color: '#f8fafc' }}>{stageItem.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            Stage Conversion: <strong style={{ color: '#e2e8f0' }}>{stageItem.conversion}%</strong>
                          </span>
                          <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '14px' }}>
                            {stageItem.count} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '400' }}>({stageItem.percentage}%)</span>
                          </span>
                        </div>
                      </div>

                      {/* Visual Funnel Bar */}
                      <div style={{ background: '#1e293b', borderRadius: '8px', height: '28px', padding: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                          width: `${widthPct}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${stageItem.color} 0%, ${stageItem.color}cc 100%)`,
                          borderRadius: '6px',
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '10px',
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                            {stageItem.count} candidates
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Two Column Grid (Top Job Positions & Recent Activity Log) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {/* Left: Top Job Performance */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                  📋 Job Position Activity
                </h3>
                <Link href="/jobs">
                  <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}>
                    All Jobs →
                  </span>
                </Link>
              </div>

              {topJobs.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No jobs created yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topJobs.map((j: TopJob) => (
                    <Link key={j.id} href={`/jobs/${j.id}`}>
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
                              {j.title}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
                              background: j.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: j.status === 'published' ? '#34d399' : '#cbd5e1',
                            }}>
                              {j.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {j.applicationsCount} applicants • {j.interviewsCount} interviews
                          </p>
                        </div>
                        <span style={{ color: '#818cf8', fontSize: '14px' }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Recent Activities Timeline */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                  ⚡ Recent Activity Feed
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Live Updates</span>
              </div>

              {activities.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '24px' }}>No recent activity</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activities.map((act: ActivityItem) => {
                    const badge = getStatusBadgeStyle(act.status);
                    return (
                      <Link key={act.id} href={act.link}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '10px',
                          background: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            flexShrink: 0,
                          }}>
                            {getActivityIcon(act.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                              <p style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {act.title}
                              </p>
                              <span style={{ fontSize: '11px', color: '#64748b', flexShrink: 0, marginLeft: '8px' }}>
                                {formatRelativeTime(act.timestamp.toString())}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                              {act.description}
                            </p>
                            {act.status && (
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: '700',
                                background: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`,
                                display: 'inline-block',
                              }}>
                                {act.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}