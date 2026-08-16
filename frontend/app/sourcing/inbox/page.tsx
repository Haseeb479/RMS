'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { useInbox, InboundResumeItem } from '@/lib/hooks/useinbox';
import { useJobs } from '@/lib/hooks/usejobs';
import { useCompany } from '@/lib/hooks/usecompany';
import { useAts, AtsEvaluationResult } from '@/lib/hooks/useats';
import Link from 'next/link';

export default function ResumeInboxPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { inboxItems, loading, error, fetchInbox, convertResume, deleteResume } = useInbox();
  const { jobs, fetchJobs } = useJobs();
  const { company } = useCompany();
  const { scoreResume, batchScoreInbox, generateEmail, sendEmail, loading: atsLoading } = useAts();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'top_ats' | 'moderate_ats' | 'low_ats' | 'pending'>('all');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals
  const [selectedResume, setSelectedResume] = useState<InboundResumeItem | null>(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [targetJobId, setTargetJobId] = useState('');
  const [converting, setConverting] = useState(false);

  // ATS Report Modal
  const [selectedAtsReport, setSelectedAtsReport] = useState<{ resume: InboundResumeItem; details: AtsEvaluationResult } | null>(null);

  // AI Email Modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetResume, setEmailTargetResume] = useState<InboundResumeItem | null>(null);
  const [emailType, setEmailType] = useState<'interview_invitation' | 'application_ack' | 'rejection' | 'custom'>('interview_invitation');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [dispatchingEmail, setDispatchingEmail] = useState(false);

  // Dropzone test ingestion state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    fetchInbox();
    fetchJobs();
  }, [isLoggedIn, router, fetchInbox, fetchJobs]);

  if (!isLoggedIn) return null;

  const inboundEmail = company?.slug
    ? `inbox-${company.slug}@rms-recruit.com`
    : 'inbox@rms-recruit.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(inboundEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.slug) return;

    try {
      setUploading(true);
      setActionError('');
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('senderEmail', 'applicant.direct@example.com');
      formData.append('senderName', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      formData.append('source', 'manual_dropzone');
      formData.append('subject', `Resume Forward: ${file.name}`);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/public/inbox/${company.slug}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to ingest resume');
      }
      setActionMsg('✓ Resume successfully ingested! Running Groq AI ATS scoring...');
      setTimeout(() => setActionMsg(''), 4000);
      await fetchInbox();
    } catch (err: any) {
      setActionError(err.message || 'Upload failed');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBatchScore = async () => {
    try {
      setActionMsg('⚡ Groq AI is evaluating and scoring all inbound resumes...');
      const res = await batchScoreInbox();
      setActionMsg(`✓ ${res.message || 'Successfully scored all resumes!'}`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchInbox();
    } catch (err: any) {
      setActionError(err.message || 'Batch scoring failed');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleSingleScore = async (resume: InboundResumeItem) => {
    try {
      const res = await scoreResume(resume.id, resume.assignedJobId || undefined);
      setActionMsg(`✓ Groq AI scored ${resume.parsedName || 'candidate'} at ${res.atsResult.atsScore}%!`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchInbox();
    } catch (err: any) {
      setActionError(err.message || 'Scoring failed');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleConvert = async () => {
    if (!selectedResume) return;
    try {
      setConverting(true);
      await convertResume(selectedResume.id, targetJobId || undefined);
      setConvertModalOpen(false);
      setSelectedResume(null);
      setActionMsg('✓ Candidate profile created and added to Talent Pool!');
      setTimeout(() => setActionMsg(''), 3500);
      fetchInbox();
    } catch (err: any) {
      setActionError(err.message || 'Conversion failed');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setConverting(false);
    }
  };

  // Open AI Email Drafter
  const handleOpenEmailModal = async (resume: InboundResumeItem) => {
    setEmailTargetResume(resume);
    setEmailModalOpen(true);
    setEmailSubject('');
    setEmailBody('');
    await handleGenerateDraft(resume, 'interview_invitation');
  };

  const handleGenerateDraft = async (
    resume: InboundResumeItem | null = emailTargetResume,
    type: 'interview_invitation' | 'application_ack' | 'rejection' | 'custom' = emailType
  ) => {
    if (!resume) return;
    try {
      setGeneratingDraft(true);
      let skills: string[] = [];
      try {
        if (resume.parsedSkills) skills = JSON.parse(resume.parsedSkills);
      } catch {}

      const jobTitle = resume.assignedJob?.title || jobs[0]?.title || 'Senior Position';

      const draft = await generateEmail({
        type,
        candidateName: resume.parsedName || resume.senderName || 'Candidate',
        candidateEmail: resume.parsedEmail || resume.senderEmail,
        candidateSkills: skills,
        atsScore: resume.atsScore || 85,
        jobTitle,
      });

      setEmailSubject(draft.subject);
      setEmailBody(draft.body);
    } catch (err: any) {
      setActionError('Failed to generate draft. Using default template.');
      setEmailSubject(`Interview Invitation: ${jobs[0]?.title || 'Opportunity'} at RMS`);
      setEmailBody(`Dear ${resume.parsedName || 'Candidate'},\n\nWe reviewed your credentials (ATS Score: ${resume.atsScore || 85}%) and would like to invite you for an interview.`);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendEmailConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTargetResume) return;

    try {
      setDispatchingEmail(true);
      await sendEmail({
        candidateId: emailTargetResume.candidateId || undefined,
        candidateName: emailTargetResume.parsedName || emailTargetResume.senderName || 'Candidate',
        candidateEmail: emailTargetResume.parsedEmail || emailTargetResume.senderEmail,
        subject: emailSubject,
        body: emailBody,
        type: emailType,
      });

      setEmailModalOpen(false);
      setEmailTargetResume(null);
      setActionMsg(`✓ Email successfully sent to ${emailTargetResume.parsedName || emailTargetResume.senderName}!`);
      setTimeout(() => setActionMsg(''), 4000);
      fetchInbox();
    } catch (err: any) {
      setActionError(err.message || 'Failed to send email');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setDispatchingEmail(false);
    }
  };

  // Filter Resumes by ATS Tiers
  const topAtsItems = inboxItems.filter((i) => (i.atsScore || 0) >= 80);
  const moderateAtsItems = inboxItems.filter((i) => (i.atsScore || 0) >= 60 && (i.atsScore || 0) < 80);
  const lowAtsItems = inboxItems.filter((i) => i.atsScore !== null && i.atsScore !== undefined && (i.atsScore || 0) < 60);
  const pendingAtsItems = inboxItems.filter((i) => i.atsScore === null || i.atsScore === undefined);

  const filteredItems = inboxItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'top_ats') return (item.atsScore || 0) >= 80;
    if (activeTab === 'moderate_ats') return (item.atsScore || 0) >= 60 && (item.atsScore || 0) < 80;
    if (activeTab === 'low_ats') return item.atsScore !== null && item.atsScore !== undefined && (item.atsScore || 0) < 60;
    if (activeTab === 'pending') return item.atsScore === null || item.atsScore === undefined;
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="zr-subheader-title">Resume Inbox &amp; Groq AI ATS Hub</h1>
              <span className="zr-badge zr-badge-blue" style={{ fontSize: 11 }}>
                ⚡ Powered by Llama 3.3 70B
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Automatic email CV parsing, deep multi-factor ATS scoring tiers, and 1-click AI interview outreach
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleBatchScore}
              disabled={atsLoading}
              className="zr-btn zr-btn-orange zr-btn-sm"
              title="Runs Groq AI ATS evaluation on all inbound resumes"
            >
              {atsLoading ? 'Evaluating with AI...' : '⚡ Score All Inbound Resumes (AI)'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="zr-btn zr-btn-outline zr-btn-sm"
            >
              {uploading ? 'Ingesting...' : '+ Upload Test Resume'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.docx,.txt"
              onChange={handleTestUpload}
            />
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: 1150 }}>
          {/* Action Toasts */}
          {actionMsg && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {actionMsg}
            </div>
          )}

          {actionError && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {actionError}
            </div>
          )}

          {/* Inbound Email Channel Address Card */}
          <div className="zr-card" style={{ padding: '14px 18px', marginBottom: 18, background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-blue-light)', color: 'var(--zr-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                📬
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--zr-text)' }}>
                  Inbound Email Address for Candidate Ingestion
                </div>
                <code style={{ fontSize: 13, color: 'var(--zr-blue)', background: 'var(--zr-bg)', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                  {inboundEmail}
                </code>
              </div>
            </div>

            <button onClick={copyEmail} className="zr-btn zr-btn-outline zr-btn-xs">
              {copiedEmail ? '✓ Copied!' : '📋 Copy Inbound Email'}
            </button>
          </div>

          {/* ════════ ATS SCORE SPLITTING TABS ════════ */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
            {[
              { id: 'all', label: 'All Inbound CVs', count: inboxItems.length, color: 'var(--zr-text)' },
              { id: 'top_ats', label: '⭐ Top ATS Matches (80%+)', count: topAtsItems.length, color: '#27AE60', bg: '#EDFBF4' },
              { id: 'moderate_ats', label: '📋 Moderate Matches (60-79%)', count: moderateAtsItems.length, color: '#1473E6', bg: '#EEF4FF' },
              { id: 'low_ats', label: '⚠️ Low Matches (<60%)', count: lowAtsItems.length, color: '#E8652A', bg: '#FFF4EE' },
              { id: 'pending', label: '⏳ Unscored', count: pendingAtsItems.length, color: 'var(--zr-muted)', bg: 'var(--zr-bg)' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: `1px solid ${isSelected ? 'var(--zr-blue)' : 'var(--zr-border)'}`,
                    background: isSelected ? 'var(--zr-blue-light)' : 'var(--zr-white)',
                    color: isSelected ? 'var(--zr-blue)' : 'var(--zr-text-2)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      background: tab.bg || 'var(--zr-bg)',
                      color: tab.color,
                      padding: '1px 6px',
                      borderRadius: 10,
                      fontWeight: 800,
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ════════ RESUMES TABLE ════════ */}
          <div className="zr-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="zr-table">
                <thead>
                  <tr>
                    <th>Candidate / Extracted Details</th>
                    <th>Groq AI ATS Score</th>
                    <th>Extracted Skills</th>
                    <th>Target Role</th>
                    <th>Ingestion Date</th>
                    <th style={{ textAlign: 'right' }}>AI &amp; Recruiter Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--zr-muted)' }}>
                        No inbound resumes in this ATS category.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      let skillsList: string[] = [];
                      try {
                        skillsList = item.parsedSkills ? JSON.parse(item.parsedSkills) : [];
                      } catch {}

                      let matchDetails: AtsEvaluationResult | null = null;
                      try {
                        if (item.atsMatchDetails) matchDetails = JSON.parse(item.atsMatchDetails);
                      } catch {}

                      const score = item.atsScore;
                      const isTop = score !== null && score !== undefined && score >= 80;
                      const isMod = score !== null && score !== undefined && score >= 60 && score < 80;

                      return (
                        <tr key={item.id} style={{ background: isTop ? 'rgba(39, 174, 96, 0.02)' : 'transparent' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34, height: 34, borderRadius: '50%',
                                  background: isTop ? 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' : 'linear-gradient(135deg, var(--zr-blue) 0%, #4FA4F4 100%)',
                                  color: '#fff', fontWeight: 700, fontSize: 12,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}
                              >
                                {(item.parsedName || item.senderName || 'U')[0]}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>
                                  {item.parsedName || item.senderName || 'Anonymous Candidate'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                                  {item.parsedEmail || item.senderEmail} · {item.parsedExperience ? `${item.parsedExperience} yrs exp` : 'CV Ingested'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* ATS Score Column */}
                          <td>
                            {score !== null && score !== undefined ? (
                              <button
                                onClick={() => matchDetails && setSelectedAtsReport({ resume: item, details: matchDetails })}
                                style={{
                                  background: isTop ? '#EDFBF4' : isMod ? '#EEF4FF' : '#FFF4EE',
                                  border: `1px solid ${isTop ? '#27AE60' : isMod ? '#1473E6' : '#E8652A'}`,
                                  color: isTop ? '#27AE60' : isMod ? '#1473E6' : '#E8652A',
                                  borderRadius: 16,
                                  padding: '4px 10px',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                title="Click to view full ATS match report"
                              >
                                <span>{isTop ? '⭐' : '📊'} {score}% Match</span>
                                <span style={{ fontSize: 10, textDecoration: 'underline' }}>View</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSingleScore(item)}
                                className="zr-btn zr-btn-ghost zr-btn-xs"
                                style={{ fontSize: 11, color: 'var(--zr-blue)' }}
                              >
                                ⚡ Score with AI
                              </button>
                            )}
                          </td>

                          {/* Skills Column */}
                          <td>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220 }}>
                              {skillsList.slice(0, 3).map((sk) => (
                                <span key={sk} className="zr-pill zr-pill-blue" style={{ fontSize: 10 }}>
                                  {sk}
                                </span>
                              ))}
                              {skillsList.length > 3 && (
                                <span style={{ fontSize: 10, color: 'var(--zr-muted)', alignSelf: 'center' }}>
                                  +{skillsList.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Target Role */}
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-blue)' }}>
                              {item.assignedJob?.title || jobs[0]?.title || 'Open Requisition'}
                            </div>
                          </td>

                          {/* Ingestion Date */}
                          <td style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              {/* AI Email Button */}
                              <button
                                onClick={() => handleOpenEmailModal(item)}
                                className="zr-btn zr-btn-purple zr-btn-xs"
                                title="Draft personalized outreach or interview email with AI"
                              >
                                🤖 AI Email
                              </button>

                              {/* Convert Button */}
                              {!item.candidateId && (
                                <button
                                  onClick={() => {
                                    setSelectedResume(item);
                                    setConvertModalOpen(true);
                                  }}
                                  className="zr-btn zr-btn-outline zr-btn-xs"
                                >
                                  + Add to Talent
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ════════ ATS MATCH REPORT MODAL ════════ */}
        {selectedAtsReport && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 560, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🤖 Groq AI ATS Match Report
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    {selectedAtsReport.resume.parsedName || selectedAtsReport.resume.senderName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAtsReport(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Score Meter Banner */}
              <div
                style={{
                  background: selectedAtsReport.details.atsScore >= 80 ? '#EDFBF4' : '#EEF4FF',
                  border: `1.5px solid ${selectedAtsReport.details.atsScore >= 80 ? '#27AE60' : '#1473E6'}`,
                  borderRadius: 8, padding: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--zr-muted)', textTransform: 'uppercase' }}>
                    Overall ATS Match Score
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: selectedAtsReport.details.atsScore >= 80 ? '#27AE60' : '#1473E6' }}>
                    {selectedAtsReport.details.atsScore}%
                  </div>
                </div>
                <span className={selectedAtsReport.details.atsScore >= 80 ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-blue'}>
                  {selectedAtsReport.details.atsScore >= 80 ? '⭐ Highly Recommended' : 'Candidate Under Review'}
                </span>
              </div>

              {/* Recommendation summary */}
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 12, color: 'var(--zr-text)' }}>AI Recommendation Summary:</strong>
                <p style={{ fontSize: 12, color: 'var(--zr-text-2)', background: 'var(--zr-bg)', padding: 10, borderRadius: 6, margin: '4px 0 0' }}>
                  {selectedAtsReport.details.recommendationReason}
                </p>
              </div>

              {/* Strengths & Missing Skills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <strong style={{ fontSize: 12, color: '#27AE60' }}>✓ Matched Skills / Strengths:</strong>
                  <ul style={{ fontSize: 11, color: 'var(--zr-text-2)', margin: '4px 0 0', paddingLeft: 18 }}>
                    {(selectedAtsReport.details.matchedSkills || []).slice(0, 4).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: 12, color: '#E8652A' }}>⚠ Missing / Development Areas:</strong>
                  <ul style={{ fontSize: 11, color: 'var(--zr-text-2)', margin: '4px 0 0', paddingLeft: 18 }}>
                    {(selectedAtsReport.details.missingSkills || ['None']).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => {
                    const r = selectedAtsReport.resume;
                    setSelectedAtsReport(null);
                    handleOpenEmailModal(r);
                  }}
                  className="zr-btn zr-btn-purple zr-btn-sm"
                >
                  🤖 Write AI Outreach Email →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ AI EMAIL DRAFTER & CONFIRMATION MODAL ════════ */}
        {emailModalOpen && emailTargetResume && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 620, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🤖 Groq AI Email Drafter &amp; HR Confirmation
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    To: <strong>{emailTargetResume.parsedName || emailTargetResume.senderName}</strong> ({emailTargetResume.parsedEmail || emailTargetResume.senderEmail})
                  </p>
                </div>
                <button
                  onClick={() => setEmailModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Email Template Selector */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  { id: 'interview_invitation', label: '🎯 Interview Invite' },
                  { id: 'application_ack', label: '📄 Application Received' },
                  { id: 'rejection', label: '🤝 Polite Rejection' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setEmailType(t.id as any);
                      handleGenerateDraft(emailTargetResume, t.id as any);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: `1px solid ${emailType === t.id ? 'var(--zr-purple)' : 'var(--zr-border)'}`,
                      background: emailType === t.id ? 'var(--zr-purple-light)' : 'var(--zr-white)',
                      color: emailType === t.id ? 'var(--zr-purple)' : 'var(--zr-text-2)',
                      fontSize: 12,
                      fontWeight: emailType === t.id ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendEmailConfirmation}>
                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Email Subject *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    className="zr-input"
                    placeholder={generatingDraft ? 'Generating subject with AI...' : 'Subject'}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="zr-label" style={{ margin: 0 }}>
                      Email Message Body (Editable by HR) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDraft(emailTargetResume, emailType)}
                      disabled={generatingDraft}
                      style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--zr-purple)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {generatingDraft ? '⚡ Regenerating...' : '🔄 Regenerate with Groq AI'}
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                    className="zr-input"
                    style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5 }}
                    placeholder={generatingDraft ? 'Groq Llama 3.3 is drafting your email...' : 'Email body'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                    ✓ Candidate timeline will record this email communication upon sending
                  </span>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setEmailModalOpen(false)}
                      className="zr-btn zr-btn-ghost zr-btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dispatchingEmail || generatingDraft}
                      className="zr-btn zr-btn-orange zr-btn-sm"
                    >
                      {dispatchingEmail ? 'Sending...' : '✉️ Confirm & Send Email to Candidate'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Convert Modal */}
        {convertModalOpen && selectedResume && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 480, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
                + Add Inbound Resume to Talent Pool
              </h3>
              <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '0 0 16px' }}>
                Converts {selectedResume.parsedName || selectedResume.senderName} into an active Candidate Profile.
              </p>

              <div style={{ marginBottom: 16 }}>
                <label className="zr-label">Assign to Job Opening (Optional)</label>
                <select
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="zr-input"
                >
                  <option value="">-- Do not assign to a specific job opening --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.location ? `· ${j.location}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConvertModalOpen(false)}
                  className="zr-btn zr-btn-ghost zr-btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="zr-btn zr-btn-blue zr-btn-sm"
                >
                  {converting ? 'Converting...' : 'Create Candidate Profile'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
