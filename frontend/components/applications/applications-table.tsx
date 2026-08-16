'use client';

import { ApplicationItem } from '@/lib/hooks/useapplications';
import { STAGES_CONFIG } from './kanban-board';
import Link from 'next/link';

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
      <div className="zr-empty">
        <div className="zr-empty-icon">📋</div>
        <div className="zr-empty-title">No applications found</div>
        <div className="zr-empty-desc">
          Try clearing your search filters or click &quot;Add Application&quot; above to link a candidate to an opening.
        </div>
      </div>
    );
  }

  return (
    <div className="zr-card" style={{ overflow: 'hidden' }}>
      <table className="zr-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Job Opening</th>
            <th>Stage</th>
            <th>Applied Date</th>
            <th>Match Score</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const stageConfig = STAGES_CONFIG.find((s) => s.id === app.status) || STAGES_CONFIG[0];

            return (
              <tr key={app.id}>
                {/* Candidate Info */}
                <td>
                  <Link href={`/candidates/${app.candidateId}`}>
                    <span style={{ fontWeight: 600, color: 'var(--zr-blue)', cursor: 'pointer', fontSize: '13px' }}>
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </span>
                  </Link>
                  <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                    {app.candidate?.email}
                  </div>
                </td>

                {/* Job Title */}
                <td>
                  <div style={{ fontWeight: '500', color: 'var(--zr-text)', fontSize: '13px' }}>
                    {app.job?.title || 'General Position'}
                  </div>
                  {app.job?.location && (
                    <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                      📍 {app.job.location}
                    </div>
                  )}
                </td>

                {/* Stage dropdown */}
                <td>
                  <select
                    value={app.status}
                    onChange={(e) => onMoveStage(app.id, e.target.value)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: stageConfig.color,
                      background: stageConfig.badgeBg,
                      border: `1px solid ${stageConfig.borderColor}`,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {STAGES_CONFIG.map((s) => (
                      <option key={s.id} value={s.id} style={{ color: 'var(--zr-text)', background: 'var(--zr-white)' }}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Applied Date */}
                <td style={{ color: 'var(--zr-text-2)', fontSize: '12px' }}>
                  {new Date(app.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Match Score */}
                <td>
                  {app.candidate?.score != null ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background:
                          app.candidate.score >= 75
                            ? 'var(--zr-success-light)'
                            : app.candidate.score >= 50
                            ? 'var(--zr-warning-light)'
                            : 'var(--zr-danger-light)',
                        color:
                          app.candidate.score >= 75
                            ? 'var(--zr-success)'
                            : app.candidate.score >= 50
                            ? 'var(--zr-warning)'
                            : 'var(--zr-danger)',
                      }}
                    >
                      {app.candidate.score}% Match
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--zr-muted-light)' }}>—</span>
                  )}
                </td>

                {/* Action Buttons */}
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <Link href={`/candidates/${app.candidateId}`}>
                      <button className="zr-btn zr-btn-outline zr-btn-xs">Profile</button>
                    </Link>
                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                      title="Remove application"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
