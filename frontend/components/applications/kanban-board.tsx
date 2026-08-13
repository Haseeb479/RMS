'use client';

import { useState } from 'react';
import { ApplicationItem } from '@/lib/hooks/useapplications';
import Link from 'next/link';

interface KanbanBoardProps {
  applications: ApplicationItem[];
  onMoveStage: (applicationId: string, newStage: string) => Promise<void>;
  onDeleteApplication: (applicationId: string) => Promise<void>;
}

export interface StageConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
}

export const STAGES_CONFIG: StageConfig[] = [
  {
    id: 'applied',
    label: 'Applied',
    icon: '📥',
    color: '#60a5fa',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: '🔍',
    color: '#c084fc',
    bgColor: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.25)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: '🎙️',
    color: '#fbbf24',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
  },
  {
    id: 'offer',
    label: 'Offer',
    icon: '💼',
    color: '#38bdf8',
    bgColor: 'rgba(14, 165, 233, 0.08)',
    borderColor: 'rgba(14, 165, 233, 0.25)',
    badgeBg: 'rgba(14, 165, 233, 0.2)',
  },
  {
    id: 'hired',
    label: 'Hired',
    icon: '🎉',
    color: '#34d399',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    icon: '❌',
    color: '#f87171',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
  },
];

export default function KanbanBoard({
  applications,
  onMoveStage,
  onDeleteApplication,
}: KanbanBoardProps) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    setDragOverStage(null);
    setDraggedAppId(null);

    if (appId) {
      const app = applications.find((a) => a.id === appId);
      if (app && app.status !== targetStageId) {
        await onMoveStage(appId, targetStageId);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '24px',
        minHeight: 'calc(100vh - 240px)',
        alignItems: 'flex-start',
      }}
    >
      {STAGES_CONFIG.map((stage) => {
        const stageApps = applications.filter((app) => app.status === stage.id);
        const isHovered = dragOverStage === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
            style={{
              flex: '0 0 310px',
              background: isHovered ? 'rgba(15, 23, 42, 0.95)' : stage.bgColor,
              border: `1.5px solid ${isHovered ? stage.color : stage.borderColor}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              boxShadow: isHovered ? `0 0 20px ${stage.badgeBg}` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: `1px solid ${stage.borderColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{stage.icon}</span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  {stage.label}
                </h3>
              </div>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: stage.color,
                  background: stage.badgeBg,
                  border: `1px solid ${stage.borderColor}`,
                }}
              >
                {stageApps.length}
              </span>
            </div>

            {/* Application Cards List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
                minHeight: '120px',
              }}
            >
              {stageApps.length === 0 ? (
                <div
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  Drop candidates here
                </div>
              ) : (
                stageApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'grab',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* Job Title Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#818cf8',
                          background: 'rgba(99, 102, 241, 0.15)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={app.job?.title}
                      >
                        💼 {app.job?.title || 'Unknown Job'}
                      </span>
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        title="Remove application"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 4px',
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Candidate Name */}
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#f8fafc', marginBottom: '4px' }}>
                      {app.candidate?.firstName} {app.candidate?.lastName}
                    </div>

                    {/* Candidate Contact */}
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                      ✉️ {app.candidate?.email}
                    </div>

                    {/* Candidate Stats Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {app.candidate?.experience !== undefined && app.candidate?.experience !== null && (
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>
                          ⏳ {app.candidate.experience} yrs exp
                        </span>
                      )}
                      {app.candidate?.score !== undefined && app.candidate?.score !== null && (
                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                          🎯 Score: {app.candidate.score}%
                        </span>
                      )}
                    </div>

                    {/* Footer & Stage Controls */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '11px',
                        color: '#64748b',
                      }}
                    >
                      <span>🗓 {new Date(app.createdAt).toLocaleDateString()}</span>

                      {/* Quick move dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => onMoveStage(app.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {STAGES_CONFIG.map((s) => (
                          <option key={s.id} value={s.id}>
                            Move to {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
