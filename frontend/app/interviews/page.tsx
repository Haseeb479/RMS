'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { useAuth } from '@/lib/auth-context';
import { useInterviews, InterviewItem, ScheduleInterviewData, InterviewFeedbackData } from '@/lib/hooks/useinterviews';
import InterviewsList from '@/components/interviews/interviews-list';
import ScheduleInterviewModal from '@/components/interviews/schedule-interview-modal';
import InterviewFeedbackModal from '@/components/interviews/interview-feedback-modal';

const CalendarPlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="15" x2="12" y2="19"/><line x1="10" y1="17" x2="14" y2="17"/>
  </svg>
);

export default function InterviewsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const {
    interviews, loading, error,
    fetchInterviews, scheduleInterview, addFeedback, updateStatus, deleteInterview,
  } = useInterviews();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewItem | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    fetchInterviews({
      status: activeTab === 'all' ? undefined : activeTab,
      search: searchQuery || undefined,
    });
  }, [isLoggedIn, router, activeTab, searchQuery, fetchInterviews]);

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const totalCount = interviews.length;
  const scheduledCount = interviews.filter((i) => i.status === 'scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const pendingFeedbackCount = interviews.filter((i) => i.status === 'completed' && !i.feedback).length;

  const handleScheduleSubmit = async (data: ScheduleInterviewData) => {
    await scheduleInterview(data);
    fetchInterviews({ status: activeTab === 'all' ? undefined : activeTab, search: searchQuery || undefined });
  };

  const handleFeedbackSubmit = async (id: string, data: InterviewFeedbackData) => {
    await addFeedback(id, data);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  const handleDeleteInterview = async (id: string) => {
    if (window.confirm('Remove this interview schedule?')) {
      await deleteInterview(id);
    }
  };

  const TABS = [
    { id: 'all',       label: 'All Interviews' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const statCards = [
    {
      label: 'Total',
      value: totalCount,
      color: 'var(--zr-text)',
      iconBg: 'var(--zr-bg)',
      borderColor: 'var(--zr-border)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--zr-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'Scheduled',
      value: scheduledCount,
      color: 'var(--zr-blue)',
      iconBg: 'var(--zr-blue-light)',
      borderColor: 'rgba(20,115,230,0.25)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--zr-blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      label: 'Completed',
      value: completedCount,
      color: 'var(--zr-success)',
      iconBg: 'var(--zr-success-light)',
      borderColor: 'rgba(39,174,96,0.25)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--zr-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      label: 'Pending Feedback',
      value: pendingFeedbackCount,
      color: 'var(--zr-warning)',
      iconBg: 'var(--zr-warning-light)',
      borderColor: 'rgba(243,156,18,0.25)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--zr-warning)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Interview Scheduling</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Schedule sessions, conduct interviews, and record ratings & feedback
            </p>
          </div>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="zr-btn zr-btn-primary zr-btn-sm"
          >
            <CalendarPlusIcon />
            Schedule Interview
          </button>
        </div>

        <div className="zr-content">

          {/* Stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14, marginBottom: 20,
          }}>
            {statCards.map((s) => (
              <div key={s.label} style={{
                background: 'var(--zr-white)',
                border: `1px solid ${s.borderColor}`,
                borderRadius: 'var(--zr-radius-lg)',
                padding: '16px 18px',
                boxShadow: 'var(--zr-shadow-sm)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter / Tab bar */}
          <div className="zr-card" style={{ marginBottom: 16 }}>
            <div style={{
              padding: '10px 16px', display: 'flex', gap: 12,
              alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
            }}>
              {/* Status tabs */}
              <div className="zr-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`zr-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', minWidth: 220, maxWidth: 300 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--zr-muted-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search title, candidate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="zr-input"
                  style={{ paddingLeft: 30, fontSize: 12, padding: '7px 12px 7px 30px' }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)',
              borderRadius: 8, padding: '10px 16px', marginBottom: 16,
              color: 'var(--zr-danger)', fontSize: 13,
            }}>⚠ {error}</div>
          )}

          {/* List */}
          {loading && interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--zr-muted)', fontSize: 13 }}>
              Loading interviews...
            </div>
          ) : (
            <InterviewsList
              interviews={interviews}
              onOpenFeedback={(interview) => setFeedbackInterview(interview)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteInterview={handleDeleteInterview}
            />
          )}
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={handleScheduleSubmit}
      />

      <InterviewFeedbackModal
        isOpen={!!feedbackInterview}
        interview={feedbackInterview}
        onClose={() => setFeedbackInterview(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
