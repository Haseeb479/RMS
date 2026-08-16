'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useResume } from '@/lib/hooks/useresume';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

/* ─────────────────────────── helpers ─────────────────────────── */
const STATUSES = ['new', 'contacted', 'shortlisted', 'hired', 'rejected'] as const;
type Status = typeof STATUSES[number];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string; badge: string }> = {
  new:         { label: 'New',         color: '#1473E6', bg: '#EEF4FF', border: '#1473E622', badge: 'zr-badge zr-badge-blue' },
  contacted:   { label: 'Contacted',   color: '#E8652A', bg: '#FFF4EE', border: '#E8652A22', badge: 'zr-badge zr-badge-orange' },
  shortlisted: { label: 'Shortlisted', color: '#8B5CF6', bg: '#F5F0FF', border: '#8B5CF622', badge: 'zr-badge zr-badge-purple' },
  hired:       { label: 'Hired',       color: '#27AE60', bg: '#EDFBF4', border: '#27AE6022', badge: 'zr-badge zr-badge-green' },
  rejected:    { label: 'Rejected',    color: '#E53E3E', bg: '#FFF0F0', border: '#E53E3E22', badge: 'zr-badge zr-badge-red' },
};

const TAG_PRESETS = ['Hot Lead','Passive','Referred','Top Talent','Budget Fit','Remote Only','Requires Visa','Senior','Junior','Urgent'];
const TAG_COLORS  = ['#1473E6','#8B5CF6','#E8652A','#27AE60','#E53E3E','#F59E0B','#06B6D4','#EC4899','#6366F1','#10B981'];

const NOTE_ICONS: Record<string, string> = { note: '📝', status_change: '🔄', email_sent: '📧', interview_scheduled: '📅' };

function parseJSON(raw: any): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function ScoreMeter({ score }: { score?: number | null }) {
  if (score == null) return null;
  const pct = Math.round(score);
  const color = pct >= 80 ? '#27AE60' : pct >= 50 ? '#E8652A' : '#E53E3E';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--zr-border)', borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color, minWidth: 36 }}>{pct}%</span>
      <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>Zia Score</span>
    </div>
  );
}

function TagPill({ tag, index, onRemove }: { tag: string; index: number; onRemove?: () => void }) {
  const color = TAG_COLORS[index % TAG_COLORS.length];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color, background: color + '18', borderRadius: 20, padding: '3px 10px' }}>
      {tag}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 0, lineHeight: 1, fontSize: 13, fontWeight: 700 }}>×</button>
      )}
    </span>
  );
}

/* ═══════════════════════════ PAGE ══════════════════════════════ */
export default function CandidateDetailPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;

  const { getCandidate, updateCandidate, deleteCandidate, getNotes, addNote, deleteNote } = useCandidates();
  const { getCandidateResumes, deleteResume, downloadResume } = useResume();

  const [candidate, setCandidate]       = useState<any>(null);
  const [resumes, setResumes]           = useState<any[]>([]);
  const [notes, setNotes]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState('');

  // Edit mode
  const [editMode, setEditMode]         = useState(false);
  const [editForm, setEditForm]         = useState<any>({});

  // Notes
  const [noteText, setNoteText]         = useState('');
  const [addingNote, setAddingNote]     = useState(false);

  // Tags
  const [tagInput, setTagInput]         = useState('');
  const [showTagMenu, setShowTagMenu]   = useState(false);

  // Score editor
  const [editScore, setEditScore]       = useState(false);
  const [scoreVal, setScoreVal]         = useState('');

  useEffect(() => { if (!isLoggedIn) router.push('/auth/login'); }, [isLoggedIn, router]);

  const loadAll = useCallback(async () => {
    if (!candidateId || !isLoggedIn) return;
    try {
      setLoading(true);
      setError('');
      const [cData, rData, nData] = await Promise.all([
        getCandidate(candidateId),
        getCandidateResumes(candidateId).catch(() => []),
        getNotes(candidateId).catch(() => []),
      ]);
      setCandidate(cData);
      setResumes(rData);
      setNotes(nData || cData?.activityNotes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate');
    } finally {
      setLoading(false);
    }
  }, [candidateId, isLoggedIn]); // eslint-disable-line

  useEffect(() => { loadAll(); }, [loadAll]);

  // Populate edit form when entering edit mode
  useEffect(() => {
    if (editMode && candidate) {
      setEditForm({
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        experience: candidate.experience ?? '',
        salary: candidate.salary ?? '',
        notes: candidate.notes || '',
      });
    }
  }, [editMode, candidate]);

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const payload: any = { ...editForm };
      if (payload.experience !== '') payload.experience = Number(payload.experience);
      else delete payload.experience;
      if (payload.salary !== '') payload.salary = Number(payload.salary);
      else delete payload.salary;
      const updated = await updateCandidate(candidateId, payload);
      setCandidate((prev: any) => ({ ...prev, ...updated }));
      setEditMode(false);
      showSave('✅ Profile saved');
    } catch (err: any) {
      showSave('❌ ' + (err.message || 'Save failed'));
    } finally { setSaving(false); }
  };

  const showSave = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  // Status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await updateCandidate(candidateId, { status: newStatus });
      setCandidate((prev: any) => ({ ...prev, ...updated }));
      const noteEntry = await addNote(candidateId, `Status changed to ${STATUS_META[newStatus as Status]?.label || newStatus}`, 'System', 'status_change');
      setNotes(prev => [noteEntry, ...prev]);
    } catch (err: any) { alert(err.message); }
  };

  // Score save
  const handleSaveScore = async () => {
    const val = parseFloat(scoreVal);
    if (isNaN(val) || val < 0 || val > 100) { alert('Score must be 0–100'); return; }
    const updated = await updateCandidate(candidateId, { score: val });
    setCandidate((prev: any) => ({ ...prev, score: updated.score }));
    setEditScore(false);
  };

  // Tags
  const currentTags = parseJSON(candidate?.tags);

  const addTag = async (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || currentTags.includes(trimmed)) return;
    const newTags = [...currentTags, trimmed];
    const updated = await updateCandidate(candidateId, { tags: newTags });
    setCandidate((prev: any) => ({ ...prev, tags: updated.tags }));
    setTagInput('');
    setShowTagMenu(false);
  };

  const removeTag = async (tag: string) => {
    const newTags = currentTags.filter((t: string) => t !== tag);
    const updated = await updateCandidate(candidateId, { tags: newTags });
    setCandidate((prev: any) => ({ ...prev, tags: updated.tags }));
  };

  // Notes
  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      setAddingNote(true);
      const note = await addNote(candidateId, noteText.trim());
      setNotes(prev => [note, ...prev]);
      setNoteText('');
    } catch (err: any) { alert(err.message); }
    finally { setAddingNote(false); }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(candidateId, noteId);
      setNotes(prev => prev.filter((n: any) => n.id !== noteId));
    } catch (err: any) { alert(err.message); }
  };

  // Resume
  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Delete this resume file?')) return;
    try {
      await deleteResume(resumeId);
      setResumes(resumes.filter(r => r.id !== resumeId));
    } catch { alert('Failed to delete resume'); }
  };

  const handleGdprDelete = async () => {
    if (!confirm(`GDPR Data Erasure:\nPermanently delete ALL records for "${candidate?.firstName} ${candidate?.lastName}"?\nThis CANNOT be undone.`)) return;
    try {
      await deleteCandidate(candidate.id);
      alert('Candidate data permanently purged.');
      router.push('/candidates');
    } catch (err: any) { alert(err.message || 'Failed to execute GDPR deletion'); }
  };

  /* ────────── render guards ────────── */
  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  const applications = candidate?.applications || [];
  const skills = parseJSON(candidate?.skills);
  const tags = parseJSON(candidate?.tags);
  const meta = STATUS_META[(candidate?.status || 'new') as Status] || STATUS_META.new;

  /* ────────── JSX ────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.back()} className="zr-btn zr-btn-outline zr-btn-xs">← Back</button>
            <h1 className="zr-subheader-title">Candidate Profile</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saveMsg && <span style={{ fontSize: 12, color: saveMsg.startsWith('✅') ? 'var(--zr-success)' : 'var(--zr-danger)' }}>{saveMsg}</span>}
            {candidate && (
              <>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)} className="zr-btn zr-btn-outline zr-btn-xs">✏️ Edit Profile</button>
                ) : (
                  <>
                    <button onClick={() => setEditMode(false)} className="zr-btn zr-btn-ghost zr-btn-xs">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={saving} className="zr-btn zr-btn-blue zr-btn-xs">
                      {saving ? 'Saving…' : '💾 Save'}
                    </button>
                  </>
                )}
                <button onClick={handleGdprDelete} className="zr-btn zr-btn-danger-ghost zr-btn-xs">🔒 GDPR Erasure</button>
              </>
            )}
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: 960 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--zr-muted)', fontSize: 13 }}>Loading candidate profile...</div>
          ) : error ? (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 8, padding: '12px 16px', color: 'var(--zr-danger)', fontSize: 13 }}>⚠ {error}</div>
          ) : candidate ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

              {/* ══ LEFT COLUMN ══ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Profile card */}
                <div className="zr-card" style={{ padding: 24 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--zr-orange) 0%, #FF8C5A 100%)',
                      color: '#fff', fontSize: 20, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {`${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                        {candidate.firstName} {candidate.lastName}
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--zr-muted)', margin: '2px 0 0' }}>{candidate.email}</p>
                    </div>
                    {/* Stage selector */}
                    <select
                      value={candidate.status || 'new'}
                      onChange={e => handleStatusChange(e.target.value)}
                      className={meta.badge}
                      style={{ border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', background: 'inherit', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', padding: 'inherit', borderRadius: 'inherit' }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                  </div>

                  {/* Zia Score */}
                  <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--zr-bg)', borderRadius: 8, border: '1px solid var(--zr-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-text-2)' }}>🤖 Zia AI Match Score</span>
                      {!editScore ? (
                        <button onClick={() => { setScoreVal(String(candidate.score ?? '')); setEditScore(true); }} className="zr-btn zr-btn-ghost zr-btn-xs">Edit</button>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="number" min={0} max={100} value={scoreVal}
                            onChange={e => setScoreVal(e.target.value)}
                            className="zr-input"
                            style={{ width: 70, padding: '4px 8px', fontSize: 12 }}
                          />
                          <button onClick={handleSaveScore} className="zr-btn zr-btn-blue zr-btn-xs">Save</button>
                          <button onClick={() => setEditScore(false)} className="zr-btn zr-btn-ghost zr-btn-xs">✕</button>
                        </div>
                      )}
                    </div>
                    {candidate.score != null
                      ? <ScoreMeter score={candidate.score} />
                      : <p style={{ fontSize: 12, color: 'var(--zr-muted-light)', margin: 0 }}>No score set — click Edit to assign a match score (0–100)</p>
                    }
                  </div>

                  {/* Info grid — View or Edit */}
                  {editMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {[
                        { label: 'First Name', key: 'firstName', type: 'text' },
                        { label: 'Last Name',  key: 'lastName',  type: 'text' },
                        { label: 'Email',      key: 'email',     type: 'email' },
                        { label: 'Phone',      key: 'phone',     type: 'tel' },
                        { label: 'Location',   key: 'location',  type: 'text' },
                        { label: 'Experience (yrs)', key: 'experience', type: 'number' },
                        { label: 'Expected Salary', key: 'salary', type: 'number' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="zr-label">{f.label}</label>
                          <input
                            type={f.type}
                            className="zr-input"
                            value={editForm[f.key] ?? ''}
                            onChange={e => setEditForm((prev: any) => ({ ...prev, [f.key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <label className="zr-label">Internal Notes</label>
                        <textarea
                          className="zr-input"
                          rows={3}
                          value={editForm.notes ?? ''}
                          onChange={e => setEditForm((prev: any) => ({ ...prev, notes: e.target.value }))}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
                      {[
                        { label: 'Phone',      value: candidate.phone },
                        { label: 'Location',   value: candidate.location, prefix: '📍' },
                        { label: 'Experience', value: candidate.experience != null ? `${candidate.experience} years` : null },
                        { label: 'Expected Salary', value: candidate.salary != null ? `$${candidate.salary.toLocaleString()}` : null },
                      ].filter(f => f.value).map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                          <div style={{ fontSize: 13, color: 'var(--zr-text)', marginTop: 2 }}>{f.prefix}{f.value}</div>
                        </div>
                      ))}
                      {candidate.notes && (
                        <div style={{ gridColumn: '1/-1', paddingTop: 12, borderTop: '1px solid var(--zr-border-light)' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Internal Notes</div>
                          <div style={{ fontSize: 13, color: 'var(--zr-text-2)', lineHeight: 1.5 }}>{candidate.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="zr-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 12 }}>💡 Skills &amp; Expertise</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {skills.map((sk: string, i: number) => (
                        <span key={i} style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-blue)', background: 'var(--zr-blue-light)', borderRadius: 20, padding: '4px 12px' }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-screening answers */}
                {applications.length > 0 && applications.some((a: any) => a.answers?.length > 0) && (
                  <div className="zr-card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 14 }}>📋 Pre-Screening Responses</h3>
                    {applications.map((app: any) => {
                      const answers = app.answers || [];
                      if (!answers.length) return null;
                      return (
                        <div key={app.id} style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--zr-blue)', marginBottom: 8 }}>
                            Application: {app.job?.title || 'General Position'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {answers.map((ans: any, idx: number) => (
                              <div key={ans.id} style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 8, padding: '10px 14px' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-text-2)', marginBottom: 2 }}>Q{idx + 1}: {ans.screeningQuestion?.question}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-success)' }}>A: {ans.answer}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Resumes */}
                <div className="zr-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 14 }}>📄 Résumés &amp; Attachments ({resumes.length})</h3>
                  {resumes.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--zr-muted)' }}>No resume files attached.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {resumes.map(resume => (
                        <div key={resume.id} style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)' }}>{resume.fileName}</div>
                            <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 2 }}>
                              {(resume.fileSize / 1024).toFixed(1)} KB · {new Date(resume.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => downloadResume(resume.id, resume.fileName)} className="zr-btn zr-btn-blue zr-btn-xs">⬇ Download</button>
                            <button onClick={() => handleDeleteResume(resume.id)} className="zr-btn zr-btn-danger-ghost zr-btn-xs">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Timeline / Notes */}
                <div className="zr-card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 14 }}>🗒️ Activity &amp; Notes</h3>

                  {/* Add note */}
                  <div style={{ marginBottom: 16 }}>
                    <textarea
                      className="zr-input"
                      rows={2}
                      placeholder="Add a recruiter note, call summary, interview impression..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      style={{ resize: 'vertical', marginBottom: 8 }}
                    />
                    <button onClick={handleAddNote} disabled={addingNote || !noteText.trim()} className="zr-btn zr-btn-blue zr-btn-xs">
                      {addingNote ? 'Adding…' : '＋ Add Note'}
                    </button>
                  </div>

                  {/* Timeline */}
                  {notes.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--zr-muted)' }}>No activity yet. Add the first note above.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {notes.map((note: any, idx: number) => (
                        <div key={note.id} style={{ display: 'flex', gap: 12, paddingBottom: 16, position: 'relative' }}>
                          {/* Vertical line */}
                          {idx < notes.length - 1 && (
                            <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'var(--zr-border-light)' }} />
                          )}
                          {/* Icon */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'var(--zr-white)', border: '2px solid var(--zr-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1,
                          }}>
                            {NOTE_ICONS[note.type] || '📝'}
                          </div>
                          {/* Content */}
                          <div style={{ flex: 1, background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 8, padding: '10px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-text)' }}>{note.authorName || 'Recruiter'}</span>
                                <span style={{ fontSize: 10, color: 'var(--zr-muted-light)', background: 'var(--zr-border)', borderRadius: 20, padding: '1px 7px' }}>
                                  {note.type?.replace('_', ' ')}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                                  {new Date(note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {note.type === 'note' && (
                                  <button onClick={() => handleDeleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--zr-muted-light)', fontSize: 13, padding: '0 2px' }}>×</button>
                                )}
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--zr-text-2)', lineHeight: 1.5 }}>{note.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ══ RIGHT COLUMN ══ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Tags / Labels */}
                <div className="zr-card" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 12 }}>🏷️ Tags &amp; Labels</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: tags.length ? 10 : 0 }}>
                    {tags.map((tag: string, i: number) => (
                      <TagPill key={i} tag={tag} index={i} onRemove={() => removeTag(tag)} />
                    ))}
                    {tags.length === 0 && <span style={{ fontSize: 12, color: 'var(--zr-muted-light)' }}>No labels yet</span>}
                  </div>
                  {/* Add tag */}
                  <div style={{ position: 'relative', marginTop: 10 }}>
                    <input
                      className="zr-input"
                      placeholder="Add label..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onFocus={() => setShowTagMenu(true)}
                      onKeyDown={e => { if (e.key === 'Enter') { addTag(tagInput); setShowTagMenu(false); } if (e.key === 'Escape') setShowTagMenu(false); }}
                      style={{ fontSize: 12, padding: '6px 10px' }}
                    />
                    {showTagMenu && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                        background: 'var(--zr-white)', border: '1px solid var(--zr-border)',
                        borderRadius: 8, boxShadow: 'var(--zr-shadow)', zIndex: 50, overflow: 'hidden',
                      }}>
                        {TAG_PRESETS.filter(t => !currentTags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())).map((t, i) => (
                          <div key={i}
                            onMouseDown={() => addTag(t)}
                            style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--zr-text-2)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--zr-bg)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                          >{t}</div>
                        ))}
                        {tagInput.trim() && !TAG_PRESETS.includes(tagInput.trim()) && (
                          <div onMouseDown={() => { addTag(tagInput); setShowTagMenu(false); }}
                            style={{ padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--zr-blue)', fontWeight: 600, borderTop: '1px solid var(--zr-border-light)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--zr-blue-light)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                          >＋ Create "{tagInput.trim()}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pipeline position */}
                <div className="zr-card" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 12 }}>📊 Pipeline Stage</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {STATUSES.map(s => {
                      const m = STATUS_META[s];
                      const isActive = (candidate.status || 'new') === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 8,
                            border: isActive ? `2px solid ${m.color}` : '2px solid transparent',
                            background: isActive ? m.bg : 'transparent',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? m.color : 'var(--zr-border)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? m.color : 'var(--zr-text-2)' }}>{m.label}</span>
                          {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: m.color }}>Current</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Applications */}
                {applications.length > 0 && (
                  <div className="zr-card" style={{ padding: 18 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 12 }}>💼 Applications ({applications.length})</h3>
                    {applications.map((app: any) => (
                      <div key={app.id} style={{ padding: '10px 0', borderTop: '1px solid var(--zr-border-light)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-blue)' }}>{app.job?.title || 'General Application'}</div>
                        {app.job?.jobCode && <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>JOB-{app.job.jobCode}</div>}
                        <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 2 }}>{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Joined date */}
                <div style={{ fontSize: 11, color: 'var(--zr-muted-light)', textAlign: 'center', padding: '4px 0' }}>
                  Added {new Date(candidate.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}