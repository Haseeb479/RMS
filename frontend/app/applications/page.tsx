'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { useAuth } from '@/lib/auth-context';
import { useApplications } from '@/lib/hooks/useapplications';
import { useJobs } from '@/lib/hooks/usejobs';
import KanbanBoard, { STAGES_CONFIG } from '@/components/applications/kanban-board';
import ApplicationsTable from '@/components/applications/applications-table';
import CreateApplicationModal from '@/components/applications/create-application-modal';

export default function ApplicationsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
  } = useApplications();

  const { jobs, fetchJobs } = useJobs();

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    fetchJobs();
  }, [isLoggedIn, router, fetchJobs]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchApplications({
        jobId: selectedJobId || undefined,
        search: searchQuery || undefined,
      });
    }
  }, [isLoggedIn, selectedJobId, searchQuery, fetchApplications]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>
        Loading...
      </div>
    );
  }

  // Calculate Pipeline Metrics
  const totalCount = applications.length;
  const metrics = STAGES_CONFIG.map((stage) => ({
    ...stage,
    count: applications.filter((app) => app.status === stage.id).length,
  }));

  const handleCreateSubmit = async (data: { jobId: string; candidateId: string; status: string }) => {
    await createApplication(data);
    fetchApplications({
      jobId: selectedJobId || undefined,
      search: searchQuery || undefined,
    });
  };

  const handleMoveStage = async (applicationId: string, newStage: string) => {
    await updateApplicationStatus(applicationId, newStage);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to remove this candidate application?')) {
      await deleteApplication(applicationId);
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
              Application Pipeline
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Track, organize, and move candidates through your recruitment stages
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Switcher Toggle */}
            <div
              style={{
                display: 'flex',
                background: '#1e293b',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'kanban' ? '#6366f1' : 'transparent',
                  color: viewMode === 'kanban' ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📊 Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'table' ? '#6366f1' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📋 List
              </button>
            </div>

            {/* Create Application Trigger Button */}
            <button
              onClick={() => setIsModalOpen(true)}
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
              <span>+</span> Add Application
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 32px' }}>
          {/* Metrics Overview Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Total Applicants</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                {totalCount}
              </div>
            </div>

            {metrics.map((m) => (
              <div
                key={m.id}
                style={{
                  background: '#0f172a',
                  border: `1px solid ${m.borderColor}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: '12px', color: m.color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{m.icon}</span> {m.label}
                </div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                  {m.count}
                </div>
              </div>
            ))}
          </div>

          {/* Controls & Filter Bar */}
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
              padding: '16px',
            }}
          >
            {/* Job Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                Filter by Job:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '9px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">All Job Openings ({jobs.length})</option>
                {jobs.map((j: any) => (
                  <option key={j.id} value={j.id}>
                    {j.title} {j.location ? `(${j.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div style={{ flex: '1 1 260px', maxWidth: '320px' }}>
              <input
                type="text"
                placeholder="🔍 Search candidate name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  background: '#090d16',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
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

          {/* Main View Area */}
          {loading && applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
              Loading candidate applications...
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              applications={applications}
              onMoveStage={handleMoveStage}
              onDeleteApplication={handleDeleteApplication}
            />
          ) : (
            <ApplicationsTable
              applications={applications}
              onMoveStage={handleMoveStage}
              onDeleteApplication={handleDeleteApplication}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <CreateApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
        defaultJobId={selectedJobId}
      />
    </div>
  );
}
