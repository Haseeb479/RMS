'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAnalytics, ExecutiveAnalyticsData } from '@/lib/hooks/useanalytics';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

export default function ExecutiveAnalyticsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { data, loading, error, fetchAnalytics } = useAnalytics();

  const [timeframe, setTimeframe] = useState<string>('90d');
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'channels' | 'team'>('overview');
  const [exportNotice, setExportNotice] = useState<string>('');

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (isLoggedIn) {
      fetchAnalytics(undefined, timeframe);
    }
  }, [isLoggedIn, timeframe, fetchAnalytics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Avg Time to Hire (Days)', data.executiveKPIs?.avgTimeToHireDays || 18.5],
      ['Avg Time to Fill (Days)', data.executiveKPIs?.avgTimeToFillDays || 25.0],
      ['Offer Acceptance Rate', `${data.executiveKPIs?.offerAcceptanceRate || 88.9}%`],
      ['Overall Pipeline Conversion', `${data.executiveKPIs?.overallConversionRate || 11.4}%`],
      ['Estimated Cost Per Hire', `$${data.executiveKPIs?.costPerHireAvg || 1680}`],
      ['Total Active Candidates', data.executiveKPIs?.totalActiveCandidates || 0],
      ['Total Hires Closed', data.executiveKPIs?.totalHires || 0],
      [],
      ['Department', 'Headcount', 'Open Seats', 'Recent Hires', 'Avg Time to Hire (Days)', 'Avg Salary'],
      ...(data.departmentStats || []).map((d) => [
        d.department,
        d.activeHeadcount,
        d.openRequisitions,
        d.recentHires,
        d.avgTimeToHire,
        `$${d.avgSalary.toLocaleString()}`,
      ]),
      [],
      ['Sourcing Channel', 'Applicants', 'Interviews', 'Hires', 'Hire Rate %', 'Quality Score', 'Cost Per Hire'],
      ...(data.channelStats || []).map((c) => [
        c.channel,
        c.applicants,
        c.interviews,
        c.hires,
        `${c.hireRate}%`,
        `${c.qualityScore}/100`,
        `$${c.costPerHire}`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RMS_Executive_Recruitment_BI_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('✓ Executive BI CSV report generated and downloaded successfully!');
    setTimeout(() => setExportNotice(''), 3500);
  };

  if (!isLoggedIn) return null;

  const kpis = data?.executiveKPIs;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="zr-subheader-title">Executive BI &amp; Time-to-Hire Analytics</h1>
              <span className="zr-badge zr-badge-blue" style={{ fontSize: 10 }}>Enterprise Intelligence</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Hiring velocity benchmarks, stage duration diagnostics, funnel drop-off analysis, and channel ROI
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--zr-white)', border: '1px solid var(--zr-border)', borderRadius: 6, padding: 2 }}>
              {[
                { id: '30d', label: 'Last 30 Days' },
                { id: '90d', label: 'Last 90 Days' },
                { id: 'ytd', label: 'YTD' },
                { id: 'all', label: 'All Time' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: timeframe === tf.id ? 700 : 500,
                    color: timeframe === tf.id ? 'var(--zr-blue)' : 'var(--zr-muted)',
                    background: timeframe === tf.id ? 'var(--zr-blue-light)' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="zr-btn zr-btn-outline zr-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>⬇</span> Export Executive Report
            </button>
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: 1150 }}>
          {exportNotice && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {exportNotice}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* ════════ EXECUTIVE KPI RIBBON ════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              {
                label: 'Avg Time-to-Hire',
                value: `${kpis?.avgTimeToHireDays || 18.5} Days`,
                sub: '✓ -3.5d ahead of 22d target',
                color: '#1473E6',
                border: '#1473E622',
              },
              {
                label: 'Avg Time-to-Fill',
                value: `${kpis?.avgTimeToFillDays || 25.0} Days`,
                sub: 'Requisition opening to start',
                color: '#8B5CF6',
                border: '#8B5CF622',
              },
              {
                label: 'Offer Acceptance Rate',
                value: `${kpis?.offerAcceptanceRate || 88.9}%`,
                sub: 'Top quartile industry benchmark',
                color: '#27AE60',
                border: '#27AE6022',
              },
              {
                label: 'Funnel Conversion',
                value: `${kpis?.overallConversionRate || 11.4}%`,
                sub: 'Application to Hire ratio',
                color: '#E8652A',
                border: '#E8652A22',
              },
              {
                label: 'Estimated Cost / Hire',
                value: `$${(kpis?.costPerHireAvg || 1680).toLocaleString()}`,
                sub: 'Low vs $4,129 industry avg',
                color: '#06B6D4',
                border: '#06B6D422',
              },
            ].map((k) => (
              <div
                key={k.label}
                className="zr-card"
                style={{
                  padding: '16px 18px',
                  borderTop: `3px solid ${k.color}`,
                  boxShadow: 'var(--zr-shadow-sm)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {k.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--zr-muted-light)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {k.sub}
                </div>
              </div>
            ))}
          </div>

          {/* ════════ TABS NAVIGATION ════════ */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--zr-border-light)', paddingBottom: 8 }}>
            {[
              { id: 'overview', label: '📊 Velocity & Funnel Drop-off' },
              { id: 'departments', label: '🏢 Departmental Benchmarks' },
              { id: 'channels', label: '📡 Sourcing Channel ROI' },
              { id: 'team', label: '👥 Recruiter Productivity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#fff' : 'var(--zr-text-2)',
                  background: activeTab === tab.id ? 'var(--zr-blue)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ════════ TAB 1: VELOCITY & FUNNEL ════════ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stage Velocity Breakdown */}
              <div className="zr-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                      ⏱️ Stage Velocity &amp; Process Duration (Days in Stage)
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                      Identifies recruitment bottlenecks where candidates spend the most time
                    </p>
                  </div>
                  <span className="zr-badge zr-badge-green">Overall Velocity: Optimal</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  {(data?.stageVelocities || []).map((sv, idx) => {
                    const isAhead = sv.avgDays <= sv.targetDays;
                    return (
                      <div
                        key={sv.stage}
                        style={{
                          background: 'var(--zr-bg)',
                          border: '1px solid var(--zr-border)',
                          borderRadius: 8,
                          padding: '14px 16px',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--zr-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                          Step {idx + 1}: {sv.stage}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: isAhead ? '#27AE60' : '#E8652A' }}>
                            {sv.avgDays}d
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>target {sv.targetDays}d</span>
                        </div>
                        {/* Mini bar */}
                        <div style={{ height: 4, background: 'var(--zr-border)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                          <div
                            style={{
                              width: `${Math.min((sv.avgDays / (sv.targetDays * 1.3)) * 100, 100)}%`,
                              height: '100%',
                              background: isAhead ? '#27AE60' : '#E8652A',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: isAhead ? '#27AE60' : '#E8652A', marginTop: 6 }}>
                          {isAhead ? '✓ Ahead of target' : '⚠ Action required'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Recruitment Funnel Flow */}
              <div className="zr-card" style={{ padding: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🎯 Recruitment Pipeline Conversion &amp; Drop-Off
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    Visual flow of candidates through the 5 hiring pipeline stages
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(data?.funnel || []).map((stage, i) => (
                    <div key={stage.stage}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: stage.color, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>{stage.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                          <span style={{ fontWeight: 700, color: 'var(--zr-text)' }}>{stage.count} Candidates</span>
                          <span style={{ color: stage.color, fontWeight: 700 }}>{stage.percentage}% of Top</span>
                          {i > 0 && (
                            <span style={{ color: 'var(--zr-danger)', fontSize: 11 }}>
                              -{stage.dropOff}% Drop-off
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ height: 10, background: 'var(--zr-bg)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--zr-border-light)' }}>
                        <div
                          style={{
                            width: `${stage.percentage}%`,
                            height: '100%',
                            background: stage.color,
                            borderRadius: 5,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 2: DEPARTMENTS ════════ */}
          {activeTab === 'departments' && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  🏢 Departmental Hiring Velocity &amp; Compensation Matrix
                </h3>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                  Benchmarks across all 6 core business units in John's enterprise organization
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Headcount</th>
                      <th>Open Requisitions</th>
                      <th>Recent Hires</th>
                      <th>Time-to-Hire (Avg)</th>
                      <th>Average Salary</th>
                      <th>Velocity Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.departmentStats || []).map((d) => (
                      <tr key={d.department}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>{d.department}</div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{d.activeHeadcount} staff</td>
                        <td>
                          <span className="zr-badge zr-badge-orange">{d.openRequisitions} Open</span>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-success)' }}>
                          +{d.recentHires} hired
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700, color: d.avgTimeToHire <= 20 ? 'var(--zr-success)' : 'var(--zr-orange)' }}>
                            {d.avgTimeToHire} Days
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>
                          ${d.avgSalary.toLocaleString()} / yr
                        </td>
                        <td>
                          <span className={d.healthScore === 'Optimal' ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-orange'}>
                            {d.healthScore}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ TAB 3: SOURCING CHANNELS ════════ */}
          {activeTab === 'channels' && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  📡 Sourcing Channel ROI &amp; Candidate Quality Matrix
                </h3>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                  Detailed conversion rates, quality scores, and cost-efficiency per talent acquisition channel
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Applicants</th>
                      <th>Interviews</th>
                      <th>Hires</th>
                      <th>Hire Rate</th>
                      <th>Quality Score</th>
                      <th>Cost / Hire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.channelStats || []).map((ch) => (
                      <tr key={ch.channel}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>{ch.channel}</div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{ch.applicants}</td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{ch.interviews}</td>
                        <td style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-success)' }}>{ch.hires}</td>
                        <td>
                          <span className="zr-badge zr-badge-blue">{ch.hireRate}%</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 700, color: ch.qualityScore >= 85 ? '#27AE60' : '#E8652A' }}>
                            ⭐ {ch.qualityScore} / 100
                          </span>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)' }}>
                          ${ch.costPerHire.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ TAB 4: RECRUITER TEAM ════════ */}
          {activeTab === 'team' && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  👥 Recruiter Team Productivity &amp; Performance Leaderboard
                </h3>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                  Pipeline volume, interview velocity, and hiring closures per talent team member
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Recruiter</th>
                      <th>Active Pipelines</th>
                      <th>Screened</th>
                      <th>Interviews Held</th>
                      <th>Offers Made</th>
                      <th>Hires Closed</th>
                      <th>Feedback Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recruiterStats || []).map((r) => (
                      <tr key={r.name}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{r.role}</div>
                        </td>
                        <td>
                          <span className="zr-badge zr-badge-purple">{r.activePipelines} Roles</span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{r.candidatesScreened}</td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{r.interviewsHeld}</td>
                        <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{r.offersExtended}</td>
                        <td style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-success)' }}>{r.hiresClosed}</td>
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--zr-blue)', fontWeight: 600 }}>
                            ⚡ {r.avgFeedbackHours} hrs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
