'use client';

import { ApplicationItem } from '@/lib/hooks/useapplications';
import { STAGES_CONFIG } from './kanban-board';

interface ApplicationsTableProps {
  applications: ApplicationItem[];
  onMoveStage: (applicationId: string, newStage: string) => Promise<void>;
  onDeleteApplication: (applicationId: string) => Promise<void>;
}

export default function ApplicationsTable({
  applications,
  onMoveStage,
  onDeleteApplication,
}: ApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          color: '#94a3b8',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
          No applications found
        </h3>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Try clearing your filters or create a new application above.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <th style={{ padding: '16px 20px', fontWeight: '600' }}>Candidate</th>
            <th style={{ padding: '16px 20px', fontWeight: '600' }}>Job Opening</th>
            <th style={{ padding: '16px 20px', fontWeight: '600' }}>Stage</th>
            <th style={{ padding: '16px 20px', fontWeight: '600' }}>Applied Date</th>
            <th style={{ padding: '16px 20px', fontWeight: '600' }}>Match Score</th>
            <th style={{ padding: '16px 20px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const stageConfig = STAGES_CONFIG.find((s) => s.id === app.status) || STAGES_CONFIG[0];

            return (
              <tr
                key={app.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Candidate Info */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: '600', color: '#f8fafc' }}>
                    {app.candidate?.firstName} {app.candidate?.lastName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {app.candidate?.email}
                  </div>
                </td>

                {/* Job Title */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: '500', color: '#cbd5e1' }}>
                    {app.job?.title || 'N/A'}
                  </div>
                  {app.job?.location && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      📍 {app.job.location}
                    </div>
                  )}
                </td>

                {/* Stage Dropdown */}
                <td style={{ padding: '16px 20px' }}>
                  <select
                    value={app.status}
                    onChange={(e) => onMoveStage(app.id, e.target.value)}
                    style={{
                      background: stageConfig.bgColor,
                      border: `1px solid ${stageConfig.borderColor}`,
                      color: stageConfig.color,
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {STAGES_CONFIG.map((s) => (
                      <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Date */}
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>

                {/* Score */}
                <td style={{ padding: '16px 20px' }}>
                  {app.candidate?.score ? (
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {app.candidate.score}% Match
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>N/A</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => onDeleteApplication(app.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
