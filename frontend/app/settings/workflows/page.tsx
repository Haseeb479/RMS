'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { api } from '@/lib/api';

const STAGES = [
  { value: 'new',         label: 'New Candidate',       desc: 'Candidate just added to the portal' },
  { value: 'contacted',   label: 'Contacted',            desc: 'Recruiter has reached out' },
  { value: 'shortlisted', label: 'Shortlisted',          desc: 'Candidate moved to shortlist' },
  { value: 'interview',   label: 'Interview Stage',      desc: 'Interview has been scheduled' },
  { value: 'offer',       label: 'Offer Extended',       desc: 'Offer letter issued to candidate' },
  { value: 'rejected',    label: 'Rejected',             desc: 'Candidate not selected' },
  { value: 'hired',       label: 'Hired',                desc: 'Candidate accepted and joining' },
];

const ACTIONS = [
  { value: 'SEND_EMAIL',            label: '📧 Send Automated Email' },
  { value: 'NOTIFY_HIRING_MANAGER', label: '🔔 Notify Hiring Manager' },
  { value: 'NOTIFY_RECRUITER',      label: '📢 Notify Recruiter' },
  { value: 'LOG_AUDIT_EVENT',       label: '🔒 Log Audit Event' },
];

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  shortlisted: {
    subject: 'You have been shortlisted - {{company}} Recruitment',
    body: `Dear {{firstName}},\n\nWe're pleased to let you know that you've been shortlisted for the {{job}} position at {{company}}.\n\nWe will be in touch shortly to schedule the next steps.\n\nBest regards,\nThe {{company}} Hiring Team`,
  },
  rejected: {
    subject: 'Update on your application at {{company}}',
    body: `Dear {{firstName}},\n\nThank you for your interest in {{company}} and for taking the time to apply.\n\nAfter careful consideration, we have decided to move forward with other candidates at this time. We encourage you to apply again in the future.\n\nWishing you all the best,\nThe {{company}} Hiring Team`,
  },
  hired: {
    subject: 'Welcome to {{company}} - Offer Confirmation',
    body: `Dear {{firstName}},\n\nWe are thrilled to confirm your acceptance of our offer. You are officially joining the {{company}} team!\n\nThe HR team will be reaching out with onboarding information shortly.\n\nWelcome aboard! 🎉`,
  },
};

export default function WorkflowsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [form, setForm] = useState({ stage: '', action: 'SEND_EMAIL', templateSubject: '', templateBody: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { router.push('/auth/login'); return; }
    fetchRules();
  }, [isLoggedIn, router]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows');
      setRules(res.data.data ?? []);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (stageVal: string) => {
    const existing = rules.find(r => r.stage === stageVal);
    const defaults = DEFAULT_TEMPLATES[stageVal] || { subject: '', body: '' };
    setEditingStage(stageVal);
    setForm({
      stage: stageVal,
      action: existing?.action || 'SEND_EMAIL',
      templateSubject: existing?.templateSubject || defaults.subject,
      templateBody: existing?.templateBody || defaults.body,
      isActive: existing?.isActive !== undefined ? existing.isActive : true,
    });
    setSaveMsg('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api.post('/workflows', form);
      setSaveMsg('✅ Workflow rule saved!');
      fetchRules();
    } catch (e: any) {
      setSaveMsg('⚠️ ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const getRuleForStage = (stage: string) => rules.find(r => r.stage === stage);

  if (!isLoggedIn) return (
    <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Automated Workflows</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Configure automatic email notifications and triggers upon candidate stage progression
            </p>
          </div>
        </div>

        <div className="zr-content">
          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--zr-danger)', fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: editingStage ? '1fr 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>
            {/* Stage Rules List */}
            <div>
              <div className="zr-card" style={{ overflow: 'hidden' }}>
                <div className="zr-card-header">
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)' }}>
                    Hiring Stage Triggers
                  </h3>
                  <span style={{ fontSize: 11, color: 'var(--zr-muted)' }}>Click to configure</span>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--zr-muted)', fontSize: 13 }}>
                    Loading workflow rules...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {STAGES.map(stage => {
                      const rule = getRuleForStage(stage.value);
                      const isEditing = editingStage === stage.value;
                      return (
                        <div
                          key={stage.value}
                          onClick={() => openEditor(stage.value)}
                          style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid var(--zr-border-light)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: isEditing ? 'var(--zr-blue-light)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isEditing) (e.currentTarget as HTMLDivElement).style.background = 'var(--zr-bg)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isEditing) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zr-text)', marginBottom: '2px' }}>
                              {stage.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--zr-muted)' }}>
                              {stage.desc}
                            </div>
                          </div>
                          {rule ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={rule.isActive ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-gray'}>
                                {rule.isActive ? 'Active' : 'Paused'}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--zr-blue)', background: 'var(--zr-blue-light)', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                                {ACTIONS.find(a => a.value === rule.action)?.label || rule.action}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--zr-muted-light)' }}>
                              + Configure trigger
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Rule Editor Panel */}
            {editingStage && (
              <div className="zr-card" style={{ position: 'sticky', top: '76px' }}>
                <div className="zr-card-header">
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)' }}>
                      Configure: {STAGES.find(s => s.value === editingStage)?.label}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                      Auto-triggers when candidate enters this stage
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingStage(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--zr-muted)', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Active Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '10px 14px', background: 'var(--zr-bg)', borderRadius: 'var(--zr-radius)' }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--zr-orange)', cursor: 'pointer' }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zr-text)', cursor: 'pointer' }}>
                      Enable this automated trigger
                    </label>
                  </div>

                  {/* Action Type */}
                  <div className="zr-form-group">
                    <label className="zr-label">Automated Action</label>
                    <select
                      value={form.action}
                      onChange={e => setForm(p => ({ ...p, action: e.target.value }))}
                      className="zr-input"
                    >
                      {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>

                  {/* Email Subject */}
                  {form.action === 'SEND_EMAIL' && (
                    <>
                      <div className="zr-form-group">
                        <label className="zr-label">Email Subject</label>
                        <input
                          type="text"
                          value={form.templateSubject}
                          onChange={e => setForm(p => ({ ...p, templateSubject: e.target.value }))}
                          placeholder="e.g. Your application update at {{company}}"
                          className="zr-input"
                        />
                      </div>
                      <div className="zr-form-group">
                        <label className="zr-label">Email Body Template</label>
                        <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginBottom: '6px' }}>
                          Available tokens: <code style={{ color: 'var(--zr-blue)' }}>{'{{firstName}}'}</code>, <code style={{ color: 'var(--zr-blue)' }}>{'{{lastName}}'}</code>, <code style={{ color: 'var(--zr-blue)' }}>{'{{company}}'}</code>, <code style={{ color: 'var(--zr-blue)' }}>{'{{job}}'}</code>
                        </div>
                        <textarea
                          value={form.templateBody}
                          onChange={e => setForm(p => ({ ...p, templateBody: e.target.value }))}
                          rows={6}
                          placeholder="Dear {{firstName}},..."
                          className="zr-input"
                          style={{ resize: 'vertical', lineHeight: '1.5' }}
                        />
                      </div>
                    </>
                  )}

                  {saveMsg && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--zr-radius)',
                      fontSize: '13px',
                      marginBottom: '14px',
                      background: saveMsg.startsWith('✅') ? 'var(--zr-success-light)' : 'var(--zr-danger-light)',
                      color: saveMsg.startsWith('✅') ? 'var(--zr-success)' : 'var(--zr-danger)',
                      border: `1px solid ${saveMsg.startsWith('✅') ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`,
                      fontWeight: '600',
                    }}>
                      {saveMsg}
                    </div>
                  )}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="zr-btn zr-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', opacity: saving ? 0.65 : 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Workflow Rule'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
