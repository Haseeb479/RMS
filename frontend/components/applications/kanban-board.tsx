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
    color: '#1473E6',
    bgColor: '#F4F7FC',
    borderColor: '#D2E1F8',
    badgeBg: '#EBF3FD',
  },
  {
    id: 'screening',
    label: 'Screening',
    icon: '🔍',
    color: '#8B5CF6',
    bgColor: '#F8F6FE',
    borderColor: '#E2D9FA',
    badgeBg: '#F0ECFD',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: '🎙️',
    color: '#E8652A',
    bgColor: '#FEF7F3',
    borderColor: '#FBDDCF',
    badgeBg: '#FEF0E9',
  },
  {
    id: 'offer',
    label: 'Offer',
    icon: '💼',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    badgeBg: '#E0F2FE',
  },
  {
    id: 'hired',
    label: 'Hired',
    icon: '🎉',
    color: '#27AE60',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    badgeBg: '#E8F8EF',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    icon: '✕',
    color: '#E74C3C',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    badgeBg: '#FEF0EE',
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
              flex: '0 0 300px',
              background: isHovered ? '#FFFFFF' : stage.bgColor,
              border: `1.5px solid ${isHovered ? stage.color : stage.borderColor}`,
              borderRadius: 'var(--zr-radius-lg)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.1)' : 'var(--zr-shadow-sm)',
              transition: 'all 0.18s ease',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: `1px solid ${stage.borderColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{stage.icon}</span>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', margin: 0 }}>
                  {stage.label}
                </h3>
              </div>
              <span
                style={{
                  padding: '2px 9px',
                  borderRadius: '12px',
                  fontSize: '11px',
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
                gap: '10px',
                overflowY: 'auto',
                minHeight: '120px',
              }}
            >
              {stageApps.length === 0 ? (
                <div
                  style={{
                    border: '1.5px dashed var(--zr-border)',
                    borderRadius: 'var(--zr-radius)',
                    padding: '28px 12px',
                    textAlign: 'center',
                    color: 'var(--zr-muted)',
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.4)',
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
                      background: 'var(--zr-white)',
                      border: '1px solid var(--zr-border)',
                      borderRadius: 'var(--zr-radius)',
                      padding: '12px 14px',
                      cursor: 'grab',
                      boxShadow: 'var(--zr-shadow-sm)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--zr-blue)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(20,115,230,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--zr-border)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--zr-shadow-sm)';
                    }}
                  >
                    {/* Candidate Name & Delete */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px',
                      }}
                    >
                      <Link href={`/candidates/${app.candidateId}`}>
                        <span
                          style={{
                            fontWeight: '600',
                            fontSize: '13px',
                            color: 'var(--zr-blue)',
                            cursor: 'pointer',
                          }}
                        >
                          {app.candidate?.firstName} {app.candidate?.lastName}
                        </span>
                      </Link>
                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--zr-muted-light)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '0 2px',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--zr-danger)')}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--zr-muted-light)')}
                        title="Remove application"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Job Title */}
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--zr-text-2)',
                        fontWeight: '500',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      💼 {app.job?.title || 'General Position'}
                    </div>

                    {/* Bottom Metadata row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        color: 'var(--zr-muted)',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--zr-border-light)',
                      }}
                    >
                      <span>
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      {app.candidate?.score != null && (
                        <span
                          style={{
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: '600',
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
                      )}
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
