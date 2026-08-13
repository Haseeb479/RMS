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
      setError(err.response?.data?.error || 'Failed to load candidate');
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

  if (!isLoggedIn) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf8' }}>
      <Sidebar />

      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e5e3',
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
                background: 'transparent',
                border: '1px solid #e5e5e3',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#666',
              }}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
              Candidate Details
            </h1>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxWidth: '800px' }}>
          {loading ? (
            <p style={{ color: '#999', fontSize: '14px' }}>Loading candidate...</p>
          ) : error ? (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#991b1b',
            }}>
              ⚠️ {error}
            </div>
          ) : candidate ? (
            <>
              {/* Candidate Info Card */}
              <div style={{
                background: 'white',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                      {candidate.firstName} {candidate.lastName}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666' }}>{candidate.email}</p>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: candidate.status === 'hired' ? '#d1fae5' :
                      candidate.status === 'shortlisted' ? '#dbeafe' :
                      candidate.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                    color: candidate.status === 'hired' ? '#065f46' :
                      candidate.status === 'shortlisted' ? '#1e40af' :
                      candidate.status === 'rejected' ? '#991b1b' : '#374151',
                  }}>
                    {candidate.status || 'new'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {candidate.phone && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Phone</p>
                      <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{candidate.phone}</p>
                    </div>
                  )}
                  {candidate.location && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Location</p>
                      <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{candidate.location}</p>
                    </div>
                  )}
                  {candidate.experience !== null && candidate.experience !== undefined && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Experience</p>
                      <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{candidate.experience} years</p>
                    </div>
                  )}
                  {candidate.salary !== null && candidate.salary !== undefined && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Expected Salary</p>
                      <p style={{ fontSize: '14px', color: '#1a1a1a' }}>${candidate.salary?.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {candidate.notes && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e5e3' }}>
                    <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Notes</p>
                    <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{candidate.notes}</p>
                  </div>
                )}
              </div>

              {/* Resumes Section */}
              <div style={{
                background: 'white',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                padding: '24px',
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '16px',
                }}>
                  📄 Resumes ({resumes.length})
                </h4>

                {loadingResumes ? (
                  <p style={{ fontSize: '13px', color: '#999' }}>Loading resumes...</p>
                ) : resumes.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#999' }}>No resumes uploaded yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {resumes.map((resume: any) => (
                      <div
                        key={resume.id}
                        style={{
                          background: '#f5f5f3',
                          border: '1px solid #e5e5e3',
                          borderRadius: '6px',
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>
                            {resume.fileName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            {(resume.fileSize / 1024).toFixed(2)} KB • {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => downloadResume(resume.id, resume.fileName)}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #3b82f6',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#3b82f6',
                            }}
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteResume(resume.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
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