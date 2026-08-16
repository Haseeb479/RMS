'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { useAuth } from '@/lib/auth-context';
import { useApplications } from '@/lib/hooks/useapplications';
import { useJobs } from '@/lib/hooks/usejobs';
import KanbanBoard, { STAGES_CONFIG } from '@/components/applications/kanban-board';
import ApplicationsTable from '@/components/applications/applications-table';
import CreateApplicationModal from '@/components/applications/create-application-modal';

const KanbanIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
  </svg>
);

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

export default function ApplicationsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const {
    applications, loading, error,
    fetchApplications, createApplication, updateApplicationStatus, deleteApplication,
  } = useApplications();

  const { jobs, fetchJobs } = useJobs();

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
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

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const totalCount = applications.length;
  const metrics = STAGES_CONFIG.map((stage) => ({
    ...stage,
    count: applications.filter((app) => app.status === stage.id).length,
  }));

  const handleCreateSubmit = async (data: { jobId: string; candidateId: string; status: string }) => {
    await createApplication(data);
    fetchApplications({ jobId: selectedJobId || undefined, search: searchQuery || undefined });
  };

  const handleMoveStage = async (applicationId: string, newStage: string) => {
    await updateApplicationStatus(applicationId, newStage);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm('Remove this candidate application?')) {
      await deleteApplication(applicationId);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Application Pipeline</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Track and move candidates through your recruitment stages
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Switcher */}
            <div style={{
              display: 'flex', background: 'var(--zr-bg)',
              border: '1px solid var(--zr-border)', borderRadius: 7, padding: 3,
            }}>
              <button
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'zr-btn zr-btn-primary zr-btn-xs' : 'zr-btn zr-btn-xs'}
                style={{
                  background: viewMode === 'kanban' ? 'var(--zr-orange)' : 'transparent',
                  color: viewMode === 'kanban' ? '#fff' : 'var(--zr-muted)',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <KanbanIcon /> Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                className="zr-btn zr-btn-xs"
                style={{
                  background: viewMode === 'table' ? 'var(--zr-orange)' : 'transparent',
                  color: viewMode === 'table' ? '#fff' : 'var(--zr-muted)',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <ListIcon /> List
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="zr-btn zr-btn-primary zr-btn-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Application
            </button>
          </div>
        </div>

        <div className="zr-content">

          {/* Stage metric chips */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12, marginBottom: 20,
          }}>
            {/* Total */}
            <div style={{
              background: 'var(--zr-white)', border: '1px solid var(--zr-border)',
              borderRadius: 'var(--zr-radius-lg)', padding: '14px 16px',
              boxShadow: 'var(--zr-shadow-sm)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--zr-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-text)', marginTop: 4 }}>{totalCount}</div>
            </div>

            {metrics.map((m) => (
              <div key={m.id} style={{
                background: 'var(--zr-white)',
                border: `1px solid ${m.borderColor}`,
                borderRadius: 'var(--zr-radius-lg)', padding: '14px 16px',
                boxShadow: 'var(--zr-shadow-sm)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-text)', marginTop: 4 }}>{m.count}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="zr-card" style={{ marginBottom: 16 }}>
            <div style={{
              padding: '12px 16px', display: 'flex', gap: 12,
              alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 280px' }}>
                <label className="zr-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Job:</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="zr-input"
                  style={{ padding: '7px 10px', fontSize: 13 }}
                >
                  <option value="">All Openings ({jobs.length})</option>
                  {jobs.map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.title}{j.location ? ` (${j.location})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 220px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--zr-muted-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search candidate, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="zr-input"
                  style={{ paddingLeft: 30, fontSize: 13 }}
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

          {/* Main view */}
          {loading && applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--zr-muted)', fontSize: 13 }}>
              Loading applications...
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

      <CreateApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubmit}
        defaultJobId={selectedJobId}
      />
    </div>
  );
}
