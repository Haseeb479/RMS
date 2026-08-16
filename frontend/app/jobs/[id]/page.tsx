'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useJob } from '@/lib/hooks/usejobs';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import Link from 'next/link';
import { api } from '@/lib/api';

const STATUS_BADGES: Record<string, { cls: string; label: string }> = {
  draft:     { cls: 'zr-badge zr-badge-gray',  label: 'Draft' },
  published: { cls: 'zr-badge zr-badge-green', label: 'Live' },
  closed:    { cls: 'zr-badge zr-badge-red',   label: 'Closed' },
};

export default function JobDetailPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { job, loading, error } = useJob(id);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedIndeed, setCopiedIndeed] = useState(false);

  // Questionnaire State
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && id) {
      fetchQuestions();
    }
  }, [isLoggedIn, id]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await api.get(`/jobs/${id}/questions`);
      setQuestions(res.data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      setAddingQuestion(true);
      setQuestionError(null);
      const optionsArr = newQuestionType === 'single_choice' && newQuestionOptions.trim()
        ? newQuestionOptions.split(',').map(s => s.trim()).filter(Boolean)
        : null;

      await api.post(`/jobs/${id}/questions`, {
        question: newQuestionText.trim(),
        type: newQuestionType,
        options: optionsArr,
        isRequired: true,
      });

      setNewQuestionText('');
      setNewQuestionOptions('');
      setNewQuestionType('text');
      await fetchQuestions();
    } catch (err: any) {
      setQuestionError(err.response?.data?.error || err.message || 'Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Delete this screening question?')) {
      try {
        await api.delete(`/jobs/${id}/questions/${questionId}`);
        await fetchQuestions();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete question');
      }
    }
  };

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const statusCfg = job ? (STATUS_BADGES[job.status] || STATUS_BADGES.draft) : STATUS_BADGES.draft;
  const publicApplyUrl = typeof window !== 'undefined' ? `${window.location.origin}/apply/${id}` : `http://localhost:3000/apply/${id}`;
  const embedSnippet = `<iframe src="${publicApplyUrl}" width="100%" height="700" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicApplyUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const handleIndeedShare = () => {
    const indeedSearchUrl = `https://www.indeed.com/hire`;
    window.open(indeedSearchUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/jobs">
              <button className="zr-btn zr-btn-outline zr-btn-xs">
                ← Back to Jobs
              </button>
            </Link>
            <h1 className="zr-subheader-title">
              {job?.title || 'Job Opening Details'}
            </h1>
          </div>
          {job && (
            <span className={statusCfg.cls}>
              {statusCfg.label}
            </span>
          )}
        </div>

        <div className="zr-content" style={{ maxWidth: '960px' }}>
          {loading && <div style={{ color: 'var(--zr-muted)', textAlign: 'center', padding: '48px', fontSize: '13px' }}>Loading job details...</div>}
          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 8, padding: '14px', color: 'var(--zr-danger)', fontSize: '13px' }}>
              ⚠ {error}
            </div>
          )}

          {job && (
            <>
              {/* Job Overview Card */}
              <div className="zr-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--zr-text)', marginBottom: '8px' }}>
                  {job.title}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--zr-muted)', marginBottom: '16px' }}>
                  {job.location && (
                    <span>📍 {job.location}</span>
                  )}
                  <span>💼 {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}</span>
                  {job.salary && <span>💰 {job.salary}</span>}
                  <span>👥 {job._count?.applications ?? 0} applicants</span>
                  <span>🗓 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Pre-Screening Questionnaire Builder */}
              <div className="zr-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', margin: 0 }}>
                      📋 Candidate Pre-Screening Questionnaire
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                      Add automated assessment questions for applicants applying to this opening
                    </p>
                  </div>
                  <span className="zr-badge zr-badge-blue">
                    {questions.length} Questions
                  </span>
                </div>

                {questionError && (
                  <div style={{ padding: '10px 14px', borderRadius: '7px', background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', fontSize: '13px', marginBottom: '16px' }}>
                    ⚠ {questionError}
                  </div>
                )}

                {/* Existing Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {loadingQuestions ? (
                    <p style={{ fontSize: '12px', color: 'var(--zr-muted)' }}>Loading screening questions...</p>
                  ) : questions.length === 0 ? (
                    <div style={{ padding: '18px', background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)', textAlign: 'center', color: 'var(--zr-muted)', fontSize: '12px' }}>
                      No screening questions added yet.
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} style={{
                        background: 'var(--zr-bg)',
                        border: '1px solid var(--zr-border)',
                        borderRadius: 'var(--zr-radius)',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--zr-blue)', fontWeight: '700', fontSize: '12px' }}>
                              Q{idx + 1}.
                            </span>
                            <span style={{ color: 'var(--zr-text)', fontWeight: '600', fontSize: '13px' }}>
                              {q.question}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--zr-muted)', background: 'var(--zr-white)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--zr-border)', textTransform: 'capitalize' }}>
                              {q.type.replace('_', ' ')}
                            </span>
                          </div>
                          {q.type === 'single_choice' && q.options && (
                            <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginTop: '4px', marginLeft: '22px' }}>
                              Options: {typeof q.options === 'string' ? JSON.parse(q.options).join(', ') : q.options.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to Add New Question */}
                <form onSubmit={handleAddQuestion} style={{ background: 'var(--zr-bg)', border: '1px dashed var(--zr-border)', borderRadius: 'var(--zr-radius)', padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zr-text)', marginBottom: '10px' }}>
                    + Add New Screening Question
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. How many years of hands-on React/Next.js experience do you have?"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="zr-input"
                    />
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value)}
                      className="zr-input"
                    >
                      <option value="text">Text Response</option>
                      <option value="boolean">Yes / No</option>
                      <option value="single_choice">Multiple Choice</option>
                      <option value="number">Numeric Input</option>
                    </select>
                  </div>

                  {newQuestionType === 'single_choice' && (
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Comma-separated choices (e.g. Immediate, 2 Weeks, 1 Month)"
                        value={newQuestionOptions}
                        onChange={(e) => setNewQuestionOptions(e.target.value)}
                        className="zr-input"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={addingQuestion}
                    className="zr-btn zr-btn-primary zr-btn-sm"
                    style={{ opacity: addingQuestion ? 0.65 : 1 }}
                  >
                    {addingQuestion ? 'Adding...' : '+ Save Question'}
                  </button>
                </form>
              </div>

              {/* Multi-Platform Distribution & Links Widget */}
              <div className="zr-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px' }}>📢</span>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)' }}>
                      Multi-Platform Syndication & Sharing
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                      Distribute this job opening and sync applicants automatically
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {/* Public Portal URL */}
                  <div>
                    <label className="zr-label">Public Candidate Portal URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={publicApplyUrl}
                        className="zr-input"
                        style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--zr-blue)' }}
                      />
                      <button
                        onClick={() => copyToClipboard(publicApplyUrl, setCopiedLink)}
                        className={`zr-btn zr-btn-sm ${copiedLink ? '' : 'zr-btn-primary'}`}
                        style={{ background: copiedLink ? 'var(--zr-success)' : undefined, color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
                      >
                        {copiedLink ? '✓ Copied!' : 'Copy Link'}
                      </button>
                      <a href={publicApplyUrl} target="_blank" rel="noopener noreferrer">
                        <button className="zr-btn zr-btn-outline zr-btn-sm" style={{ whiteSpace: 'nowrap' }}>
                          Preview ↗
                        </button>
                      </a>
                    </div>
                  </div>

                  {/* Indeed Feed URL */}
                  <div>
                    <label className="zr-label">Indeed XML Feed URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={publicApplyUrl.replace('/apply/', '/api/public/feeds/indeed/').replace(job.id, 'demo-tech.xml').replace(':3000', ':5000')}
                        className="zr-input"
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                      />
                      <button
                        onClick={() => copyToClipboard(publicApplyUrl.replace('/apply/', '/api/public/feeds/indeed/').replace(job.id, 'demo-tech.xml').replace(':3000', ':5000'), setCopiedIndeed)}
                        className="zr-btn zr-btn-blue zr-btn-sm"
                        style={{ background: copiedIndeed ? 'var(--zr-success)' : undefined, color: '#fff', border: 'none', whiteSpace: 'nowrap' }}
                      >
                        {copiedIndeed ? '✓ Copied!' : 'Copy XML'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleLinkedInShare}
                    className="zr-btn zr-btn-sm"
                    style={{ background: '#0a66c2', color: '#fff', border: 'none' }}
                  >
                    💼 Share on LinkedIn
                  </button>

                  <button
                    onClick={handleIndeedShare}
                    className="zr-btn zr-btn-blue zr-btn-sm"
                  >
                    🌐 Post on Indeed
                  </button>

                  <button
                    onClick={() => copyToClipboard(embedSnippet, setCopiedEmbed)}
                    className="zr-btn zr-btn-outline zr-btn-sm"
                  >
                    💻 {copiedEmbed ? '✓ Embed Code Copied!' : 'Copy Website iFrame Embed'}
                  </button>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="zr-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '12px' }}>
                  Job Description
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--zr-text-2)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </div>
              </div>

              {/* Requirements Card */}
              {job.requirements && (
                <div className="zr-card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '12px' }}>
                    Requirements & Qualifications
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--zr-text-2)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {job.requirements}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
