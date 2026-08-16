'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import { useJobs } from '@/lib/hooks/usejobs';
import { useAnalytics, FunnelStage, ActivityItem, TopJob } from '@/lib/hooks/useanalytics';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import Link from 'next/link';

const FUNNEL_COLORS = ['#E8652A', '#1473E6', '#8B5CF6', '#27AE60', '#F39C12'];

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
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--zr-border)', borderTopColor: 'var(--zr-orange)', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Authenticating...</span>
        </div>
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
    } catch { return 'Recently'; }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'candidate': return '👤';
      case 'application': return '📄';
      case 'interview': return '📅';
      case 'job': return '💼';
      default: return '⚡';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'hired': case 'published': case 'completed': return 'zr-badge zr-badge-green';
      case 'interview': case 'scheduled': case 'shortlisted': return 'zr-badge zr-badge-purple';
      case 'screening': case 'applied': case 'contacted': return 'zr-badge zr-badge-blue';
      case 'cancelled': case 'rejected': case 'closed': return 'zr-badge zr-badge-red';
      default: return 'zr-badge zr-badge-gray';
    }
  };

  const statCards = [
    {
      label: 'Active Openings',
      value: loading ? '—' : (quickStats?.publishedJobs ?? 0),
      sub: `${quickStats?.draftJobs ?? 0} drafts · ${quickStats?.closedJobs ?? 0} closed`,
      total: quickStats?.totalJobs ?? 0,
      progress: (quickStats?.totalJobs ?? 0) > 0 ? ((quickStats?.publishedJobs ?? 0) / (quickStats?.totalJobs ?? 1)) * 100 : 0,
      barColor: '#E8652A',
      iconBg: 'var(--zr-orange-light)',
      iconColor: 'var(--zr-orange)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      ),
    },
    {
      label: 'Talent Database',
      value: loading ? '—' : (quickStats?.totalCandidates ?? 0),
      sub: `${quickStats?.candidateStats?.new ?? 0} new · ${quickStats?.candidateStats?.shortlisted ?? 0} shortlisted`,
      total: null,
      progress: Math.min((quickStats?.totalCandidates ?? 0) * 5, 100),
      barColor: '#1473E6',
      iconBg: 'var(--zr-blue-light)',
      iconColor: 'var(--zr-blue)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      label: 'Applications',
      value: loading ? '—' : (quickStats?.totalApplications ?? 0),
      sub: `${quickStats?.conversionRate ?? 0}% conversion rate`,
      total: null,
      progress: Math.min(quickStats?.conversionRate ?? 0, 100),
      barColor: '#27AE60',
      iconBg: 'var(--zr-success-light)',
      iconColor: 'var(--zr-success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
        </svg>
      ),
    },
    {
      label: 'Interviews',
      value: loading ? '—' : (quickStats?.interviewStats?.scheduled ?? 0),
      sub: `${quickStats?.interviewStats?.completed ?? 0} completed · ${quickStats?.interviewStats?.cancelled ?? 0} cancelled`,
      total: null,
      progress: (quickStats?.totalInterviews ?? 0) > 0
        ? ((quickStats?.interviewStats?.scheduled ?? 0) / (quickStats?.totalInterviews ?? 1)) * 100
        : 0,
      barColor: '#8B5CF6',
      iconBg: 'var(--zr-purple-light)',
      iconColor: 'var(--zr-purple)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header toolbar */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">
              {company?.name ? `${company.name}` : 'Recruitment'} Dashboard
            </h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Real-time overview of your hiring pipeline
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Job filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--zr-muted)', fontWeight: 500 }}>Filter:</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="zr-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              >
                <option value="">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <Link href="/jobs">
              <button className="zr-btn zr-btn-primary zr-btn-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post Job
              </button>
            </Link>
          </div>
        </div>

        <div className="zr-content">

          {/* ── Stat Cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}>
            {statCards.map((card) => (
              <div key={card.label} className="zr-stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {card.label}
                  </span>
                  <div className="zr-stat-icon" style={{ width: 38, height: 38, borderRadius: 9, background: card.iconBg, color: card.iconColor }}>
                    {card.icon}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <span className="zr-stat-value" style={{ fontSize: 32 }}>{card.value}</span>
                  {card.total !== null && (
                    <span style={{ fontSize: 12, color: 'var(--zr-muted)' }}>/ {card.total} total</span>
                  )}
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 4, background: 'var(--zr-bg)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    width: `${Math.max(card.progress, 2)}%`, height: '100%',
                    background: card.barColor, borderRadius: 4,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <p className="zr-stat-label" style={{ marginTop: 0, fontSize: 11 }}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Two-column: Funnel + Activity ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>

            {/* Hiring Funnel */}
            <div className="zr-card">
              <div className="zr-card-header">
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)' }}>Hiring Pipeline Funnel</h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>Candidate conversion across stages</p>
                </div>
                <span className="zr-badge zr-badge-orange" style={{ fontSize: 11 }}>
                  {quickStats?.conversionRate ?? 0}% Conversion
                </span>
              </div>
              <div className="zr-card-body">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--zr-muted)', fontSize: 13 }}>Loading pipeline data...</div>
                ) : funnel.length === 0 ? (
                  <div className="zr-empty">
                    <div className="zr-empty-icon">📊</div>
                    <div className="zr-empty-title">No pipeline data yet</div>
                    <div className="zr-empty-desc">Post a job and receive applications to see your hiring funnel.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {funnel.map((stageItem: FunnelStage, idx: number) => {
                      const color = FUNNEL_COLORS[idx % FUNNEL_COLORS.length];
                      const widthPct = Math.max(stageItem.percentage, 4);
                      return (
                        <div key={stageItem.stage}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: color, color: '#fff',
                                fontSize: 10, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>{idx + 1}</span>
                              <span style={{ fontWeight: 600, color: 'var(--zr-text)' }}>{stageItem.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ color: 'var(--zr-muted)', fontSize: 11 }}>
                                Conv. <strong style={{ color: 'var(--zr-text-2)' }}>{stageItem.conversion}%</strong>
                              </span>
                              <span style={{ fontWeight: 700, color: 'var(--zr-text)', minWidth: 28, textAlign: 'right' }}>
                                {stageItem.count}
                              </span>
                            </div>
                          </div>
                          <div style={{ background: 'var(--zr-bg)', borderRadius: 6, height: 22, overflow: 'hidden', padding: '2px' }}>
                            <div style={{
                              width: `${widthPct}%`, height: '100%',
                              background: color, borderRadius: 4,
                              display: 'flex', alignItems: 'center', paddingLeft: 8,
                              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                            }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                                {stageItem.percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="zr-card">
              <div className="zr-card-header">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)' }}>Recent Activity</h3>
                <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>Live</span>
              </div>
              <div style={{ padding: '12px 0', maxHeight: 360, overflowY: 'auto' }}>
                {activities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--zr-muted)', fontSize: 13 }}>
                    No recent activity yet
                  </div>
                ) : (
                  activities.map((act: ActivityItem) => (
                    <Link key={act.id} href={act.link}>
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 20px',
                        transition: 'background 0.15s', cursor: 'pointer',
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--zr-bg)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'var(--zr-orange-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, flexShrink: 0,
                        }}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                              {act.title}
                            </p>
                            <span style={{ fontSize: 10, color: 'var(--zr-muted)', flexShrink: 0 }}>
                              {formatRelativeTime(act.timestamp.toString())}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                            {act.description}
                          </p>
                          {act.status && (
                            <span className={getStatusBadgeClass(act.status)} style={{ fontSize: 10 }}>
                              {act.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Top Job Positions ── */}
          <div className="zr-card">
            <div className="zr-card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)' }}>Top Job Positions</h3>
              <Link href="/jobs">
                <span style={{ fontSize: 12, color: 'var(--zr-blue)', fontWeight: 600, cursor: 'pointer' }}>
                  View All Jobs →
                </span>
              </Link>
            </div>
            <div className="zr-card-body" style={{ padding: 0 }}>
              {topJobs.length === 0 ? (
                <div className="zr-empty" style={{ border: 'none', borderRadius: 0 }}>
                  <div className="zr-empty-icon">💼</div>
                  <div className="zr-empty-title">No job positions yet</div>
                  <div className="zr-empty-desc">Create your first job posting to see performance metrics here.</div>
                  <Link href="/jobs">
                    <button className="zr-btn zr-btn-primary zr-btn-sm">+ Post First Job</button>
                  </Link>
                </div>
              ) : (
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Applicants</th>
                      <th>Interviews</th>
                      <th style={{ textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {topJobs.map((j: TopJob) => (
                      <tr key={j.id}>
                        <td>
                          <Link href={`/jobs/${j.id}`}>
                            <span style={{ fontWeight: 600, color: 'var(--zr-blue)', cursor: 'pointer' }}>{j.title}</span>
                          </Link>
                        </td>
                        <td>
                          <span className={`zr-badge ${j.status === 'published' ? 'zr-badge-green' : j.status === 'closed' ? 'zr-badge-red' : 'zr-badge-gray'}`}>
                            {j.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--zr-text)' }}>{j.applicationsCount}</td>
                        <td style={{ fontWeight: 600, color: 'var(--zr-text)' }}>{j.interviewsCount}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/jobs/${j.id}`}>
                            <button className="zr-btn zr-btn-outline zr-btn-xs">View</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}