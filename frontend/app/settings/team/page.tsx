'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTeam, TeamMember, TeamInvite } from '@/lib/hooks/useteam';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

const ROLES = [
  { id: 'admin', label: 'Admin', desc: 'Full access to all settings, billing, team, and recruitment data' },
  { id: 'recruiter', label: 'Recruiter', desc: 'Can manage jobs, source candidates, schedule interviews, and make offers' },
  { id: 'hiring_manager', label: 'Hiring Manager', desc: 'Can review assigned jobs, evaluate applicants, and submit feedback' },
  { id: 'interviewer', label: 'Interviewer', desc: 'Can view scheduled interviews and submit scorecards & ratings' },
];

const ROLE_BADGE: Record<string, string> = {
  admin: 'zr-badge zr-badge-purple',
  recruiter: 'zr-badge zr-badge-blue',
  hiring_manager: 'zr-badge zr-badge-orange',
  interviewer: 'zr-badge zr-badge-green',
};

export default function TeamSettingsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    members,
    invites,
    loading,
    error,
    fetchMembers,
    updateMemberRole,
    removeMember,
    fetchInvites,
    sendInvite,
    cancelInvite,
  } = useTeam();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'recruiter' });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (isLoggedIn) {
      fetchMembers();
      fetchInvites();
    }
  }, [isLoggedIn, fetchMembers, fetchInvites]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateMemberRole(userId, newRole);
      setActionSuccess('Role updated successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your organization?`)) return;
    try {
      await removeMember(userId);
      setActionSuccess('Team member removed');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!inviteForm.email) {
      setModalError('Please enter an email address');
      return;
    }

    try {
      setSubmitting(true);
      await sendInvite({
        email: inviteForm.email.trim(),
        name: inviteForm.name.trim() || undefined,
        role: inviteForm.role,
        invitedBy: 'Admin',
      });
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', role: 'recruiter' });
      setActionSuccess('Invitation generated successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setModalError(err.message || 'Failed to send invite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      await cancelInvite(inviteId);
      setActionSuccess('Invitation revoked');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invite');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/auth/signup?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Team &amp; Roles</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Manage recruitment team members, access roles, and collaboration permissions
            </p>
          </div>
          <button
            onClick={() => {
              setModalError('');
              setShowInviteModal(true);
            }}
            className="zr-btn zr-btn-orange zr-btn-sm"
          >
            + Invite Member
          </button>
        </div>

        <div className="zr-content" style={{ maxWidth: 1100 }}>
          {actionSuccess && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ {actionSuccess}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* Role Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
            {ROLES.map((r) => {
              const count = members.filter((m) => m.role === r.id).length;
              return (
                <div key={r.id} className="zr-card" style={{ padding: '16px 18px', borderTop: `3px solid var(--zr-${r.id === 'admin' ? 'purple' : r.id === 'recruiter' ? 'blue' : r.id === 'hiring_manager' ? 'orange' : 'success'})` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)' }}>{r.label}</span>
                    <span className={ROLE_BADGE[r.id] || 'zr-badge'}>{count} {count === 1 ? 'user' : 'users'}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--zr-muted)', margin: 0, lineHeight: 1.4 }}>
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Active Members Table */}
          <div className="zr-card" style={{ marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  Active Team Members ({members.length})
                </h2>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                  Colleagues with active access to your company hiring workspace
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="zr-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role &amp; Permissions</th>
                    <th>Joined Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && members.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--zr-muted)' }}>
                        Loading team members...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--zr-muted)' }}>
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => {
                      const initials = (m.name || m.email).slice(0, 2).toUpperCase();

                      return (
                        <tr key={m.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, var(--zr-blue) 0%, #4FA4F4 100%)',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)' }}>
                                  {m.name || 'Team Member'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>ID: {m.id.slice(0, 8)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--zr-text-2)' }}>{m.email}</td>
                          <td>
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.id, e.target.value)}
                              className="zr-input"
                              style={{ width: 'auto', padding: '4px 8px', fontSize: 12, fontWeight: 600 }}
                            >
                              {ROLES.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--zr-muted)' }}>
                            {new Date(m.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleRemove(m.id, m.name || m.email)}
                              className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                              title="Remove team member"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  Pending Invitations ({invites.length})
                </h2>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                  Invited members who haven't accepted their registration yet
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Invitee Email</th>
                      <th>Assigned Role</th>
                      <th>Invited By</th>
                      <th>Expires In</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => {
                      const isExpired = new Date(inv.expiresAt) < new Date();
                      return (
                        <tr key={inv.id}>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)' }}>{inv.email}</div>
                            {inv.name && <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{inv.name}</div>}
                          </td>
                          <td>
                            <span className={ROLE_BADGE[inv.role] || 'zr-badge'}>
                              {ROLES.find((r) => r.id === inv.role)?.label || inv.role}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--zr-muted)' }}>{inv.invitedBy || 'Admin'}</td>
                          <td style={{ fontSize: 12, color: isExpired ? 'var(--zr-danger)' : 'var(--zr-text-2)' }}>
                            {isExpired ? 'Expired' : new Date(inv.expiresAt).toLocaleDateString()}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => copyInviteLink(inv.token)}
                                className="zr-btn zr-btn-outline zr-btn-xs"
                              >
                                {copiedToken === inv.token ? '✓ Copied Link' : '🔗 Copy Link'}
                              </button>
                              <button
                                onClick={() => handleCancelInvite(inv.id)}
                                className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 480, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  Invite Team Member
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
                  ⚠ {modalError}
                </div>
              )}

              <form onSubmit={handleSendInvite}>
                <div style={{ marginBottom: 14 }}>
                  <label className="zr-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="zr-label">Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Sarah Jenkins"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="zr-label">Role &amp; Permissions *</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="zr-input"
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label} — {r.desc.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="zr-btn zr-btn-ghost zr-btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="zr-btn zr-btn-orange zr-btn-sm"
                  >
                    {submitting ? 'Generating Invite...' : 'Generate & Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
