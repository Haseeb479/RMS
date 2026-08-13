'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { useAuth } from '@/lib/auth-context';
import { useInterviews, InterviewItem, ScheduleInterviewData, InterviewFeedbackData } from '@/lib/hooks/useinterviews';
import InterviewsList from '@/components/interviews/interviews-list';
import ScheduleInterviewModal from '@/components/interviews/schedule-interview-modal';
import InterviewFeedbackModal from '@/components/interviews/interview-feedback-modal';

export default function InterviewsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const {
    interviews,
    loading,
    error,
    fetchInterviews,
    scheduleInterview,
    addFeedback,
    updateStatus,
    deleteInterview,
  } = useInterviews();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewItem | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    fetchInterviews({
      status: activeTab === 'all' ? undefined : activeTab,
      search: searchQuery || undefined,
    });
  }, [isLoggedIn, router, activeTab, searchQuery, fetchInterviews]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>
        Loading...
      </div>
    );
  }

  // Calculate stats
  const totalCount = interviews.length;
  const scheduledCount = interviews.filter((i) => i.status === 'scheduled').length;
  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const pendingFeedbackCount = interviews.filter((i) => i.status === 'completed' && !i.feedback).length;

  const handleScheduleSubmit = async (data: ScheduleInterviewData) => {
    await scheduleInterview(data);
    fetchInterviews({
      status: activeTab === 'all' ? undefined : activeTab,
      search: searchQuery || undefined,
    });
  };

  const handleFeedbackSubmit = async (id: string, data: InterviewFeedbackData) => {
    await addFeedback(id, data);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  const handleDeleteInterview = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this interview schedule?')) {
      await deleteInterview(id);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: 'calc(100% - 240px)' }}>
        {/* Top Header */}
        <div
          style={{
            background: '#0f172a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              Interview Scheduling
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Schedule sessions, conduct interviews, and record interviewer ratings & feedback
            </p>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>+</span> Schedule Interview
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 32px' }}>
          {/* Metrics Header Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Total Interviews</div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                {totalCount}
              </div>
            </div>

            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗓</span> Upcoming / Scheduled
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                {scheduledCount}
              </div>
            </div>

            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✓</span> Completed Rounds
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                {completedCount}
              </div>
            </div>

            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📝</span> Pending Feedback
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                {pendingFeedbackCount}
              </div>
            </div>
          </div>

          {/* Filter Bar & Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 16px',
            }}
          >
            {/* Status Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: 'All Interviews' },
                { id: 'scheduled', label: 'Scheduled' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#6366f1' : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ flex: '1 1 240px', maxWidth: '320px' }}>
              <input
                type="text"
                placeholder="🔍 Search title, candidate, interviewer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#f87171',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Main List */}
          {loading && interviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
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

      {/* Modals */}
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
