'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { api } from '@/lib/api';

export default function SecurityAuditLogsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    } else {
      fetchLogs();
    }
  }, [isLoggedIn, router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/audit');
      setLogs(res.data.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  const getActionBadgeClass = (action: string) => {
    if (action.includes('GDPR') || action.includes('DELETED')) {
      return 'zr-badge zr-badge-red';
    }
    if (action.includes('SUBMITTED') || action.includes('CREATED')) {
      return 'zr-badge zr-badge-green';
    }
    if (action.includes('UPDATED') || action.includes('STATUS')) {
      return 'zr-badge zr-badge-blue';
    }
    return 'zr-badge zr-badge-gray';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Security & Audit Logs</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Enterprise Compliance — Immutable audit trail of system events, status changes, and access records
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="zr-btn zr-btn-outline zr-btn-sm"
          >
            🔄 Refresh Logs
          </button>
        </div>

        <div className="zr-content">
          {/* Compliance Banner */}
          <div style={{
            background: 'var(--zr-blue-light)',
            border: '1px solid rgba(20, 115, 230, 0.2)',
            borderRadius: 'var(--zr-radius)',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--zr-blue)' }}>
                Compliance & Activity Tracking Active
              </div>
              <div style={{ fontSize: '12px', color: 'var(--zr-text-2)', marginTop: '2px' }}>
                All sensitive actions (candidate stage shifts, application additions, and GDPR data requests) are recorded with timestamps and origin IP addresses.
              </div>
            </div>
          </div>

          {/* Audit Logs Table Card */}
          <div className="zr-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--zr-muted)', fontSize: '13px' }}>
                Fetching security audit logs...
              </div>
            ) : error ? (
              <div style={{ padding: '32px', color: 'var(--zr-danger)', fontSize: '13px', textAlign: 'center' }}>
                ⚠ {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="zr-empty">
                <div className="zr-empty-icon">📑</div>
                <div className="zr-empty-title">No Audit Logs Recorded Yet</div>
                <div className="zr-empty-desc">
                  System events and administrator actions will be listed here automatically.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Event Action</th>
                      <th>Details</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => {
                      const badgeCls = getActionBadgeClass(log.action);
                      const formattedDate = new Date(log.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      return (
                        <tr key={log.id}>
                          <td style={{ color: 'var(--zr-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {formattedDate}
                          </td>
                          <td>
                            <span className={badgeCls}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ color: 'var(--zr-text)', fontSize: '13px' }}>
                            {log.details || '—'}
                          </td>
                          <td style={{ color: 'var(--zr-muted)', fontSize: '11px', fontFamily: 'monospace' }}>
                            {log.ipAddress || 'Internal/Client'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
