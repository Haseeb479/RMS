'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useResume } from '@/lib/hooks/useresume';
import Sidebar from '@/components/sidebar';

export default function CandidateDetailPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const { getCandidate } = useCandidates();
  const { getCandidateResumes, deleteResume, downloadResume } = useResume();

  const [candidate, setCandidate] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (candidateId && isLoggedIn) {
      loadCandidate();
    }
  }, [candidateId, isLoggedIn]);

  useEffect(() => {
    if (candidate?.id) {
      loadResumes();
    }
  }, [candidate?.id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCandidate(candidateId);
      setCandidate(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate');
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      const data = await getCandidateResumes(candidate.id);
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm('Delete this resume?')) {
      try {
        await deleteResume(resumeId);
        setResumes(resumes.filter((r: any) => r.id !== resumeId));
        alert('Resume deleted!');
      } catch (err) {
        alert('Failed to delete resume');
      }
    }
  };

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#94a3b8',
              }}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>
              Candidate Details
            </h1>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxWidth: '800px' }}>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading candidate...</p>
          ) : error ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#f87171',
            }}>
              ⚠️ {error}
            </div>
          ) : candidate ? (
            <>
              {/* Candidate Info Card */}
              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                      {candidate.firstName} {candidate.lastName}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>{candidate.email}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: candidate.status === 'hired' ? 'rgba(16, 185, 129, 0.15)' :
                      candidate.status === 'shortlisted' ? 'rgba(99, 102, 241, 0.15)' :
                      candidate.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                    color: candidate.status === 'hired' ? '#34d399' :
                      candidate.status === 'shortlisted' ? '#818cf8' :
                      candidate.status === 'rejected' ? '#f87171' : '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    {candidate.status || 'new'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {candidate.phone && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Phone</p>
                      <p style={{ fontSize: '14px', color: '#f8fafc' }}>{candidate.phone}</p>
                    </div>
                  )}
                  {candidate.location && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Location</p>
                      <p style={{ fontSize: '14px', color: '#f8fafc' }}>{candidate.location}</p>
                    </div>
                  )}
                  {candidate.experience !== null && candidate.experience !== undefined && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Experience</p>
                      <p style={{ fontSize: '14px', color: '#f8fafc' }}>{candidate.experience} years</p>
                    </div>
                  )}
                  {candidate.salary !== null && candidate.salary !== undefined && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Expected Salary</p>
                      <p style={{ fontSize: '14px', color: '#f8fafc' }}>${candidate.salary?.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {candidate.notes && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Notes</p>
                    <p style={{ fontSize: '14px', color: '#cbd5e1' }}>{candidate.notes}</p>
                  </div>
                )}
              </div>

              {/* Resumes Section */}
              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#f8fafc',
                  marginBottom: '16px',
                }}>
                  📄 Resumes ({resumes.length})
                </h4>

                {loadingResumes ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Loading resumes...</p>
                ) : resumes.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b' }}>No resumes uploaded yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {resumes.map((resume: any) => (
                      <div
                        key={resume.id}
                        style={{
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#f8fafc' }}>
                            {resume.fileName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            {(resume.fileSize / 1024).toFixed(2)} KB • {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => downloadResume(resume.id, resume.fileName)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#818cf8',
                              fontWeight: '500',
                            }}
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}