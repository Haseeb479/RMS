'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotifications, NotificationItem } from '@/lib/hooks/usenotifications';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':            'Dashboard',
  '/analytics':            'Executive BI & Analytics',
  '/candidates':           'Candidates',
  '/candidates/search':    'Resume Search',
  '/payroll':              'Enterprise Payroll',
  '/payroll-mobility':     'Succession & Mobility',
  '/jobs':                 'Job Openings',
  '/sourcing/inbox':       'Resume Inbox',
  '/jobs/sourcing':        'Sourcing & Syndication',
  '/applications':         'Applications',
  '/interviews':           'Interviews',
  '/offers':               'Offer Letters',
  '/tasks':                'Tasks & Collaboration',
  '/settings/team':        'Team & Roles',
  '/settings/career-site': 'Career Site Builder',
  '/settings/workflows':   'Automated Workflows',
  '/settings/audit':       'Audit Logs',
  '/settings/company':     'Company Settings',
};

const TYPE_ICONS: Record<string, { icon: string; bg: string }> = {
  high_ats_match: { icon: '⭐', bg: '#EDFBF4' },
  payroll_departure: { icon: '🚪', bg: '#FFF4EE' },
  inbound_resume: { icon: '📬', bg: '#EEF4FF' },
  offer_signed: { icon: '📝', bg: '#F5F0FF' },
  interview_alert: { icon: '📅', bg: '#FEF3C7' },
  general: { icon: '🔔', bg: '#F3F4F6' },
};

const BreadcrumbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#DDE1EC', margin: '0 6px' }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--zr-muted-light)', flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--zr-muted)' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();

  const pageLabel = PAGE_LABELS[pathname] || 'Recruit Pro';

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/candidates/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'ats') return n.type === 'high_ats_match';
    if (filterType === 'payroll') return n.type === 'payroll_departure';
    if (filterType === 'offers') return n.type === 'offer_signed';
    return true;
  });

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      setShowNotifications(false);
      router.push(notif.link);
    }
  };

  return (
    <header style={{
      height: 'var(--zr-topnav-h)',
      background: 'var(--zr-white)',
      borderBottom: '1px solid var(--zr-border)',
      position: 'fixed',
      top: 0,
      left: 'var(--zr-sidebar-w)',
      right: 0,
      zIndex: 150,
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      boxShadow: '0 1px 0 var(--zr-border)',
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: 'var(--zr-muted)', fontWeight: 400, whiteSpace: 'nowrap' }}>
          Recruit Pro
        </span>
        <BreadcrumbIcon />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)', whiteSpace: 'nowrap' }}>
          {pageLabel}
        </span>
      </div>

      {/* Global search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--zr-bg)',
        border: '1px solid var(--zr-border)',
        borderRadius: 7,
        padding: '7px 12px',
        width: 280,
        flexShrink: 0,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--zr-blue)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(20,115,230,0.1)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--zr-white)';
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--zr-border)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--zr-bg)';
        }}
      >
        <SearchIcon />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search candidates, jobs..."
          style={{
            border: 'none', background: 'transparent', outline: 'none', boxShadow: 'none',
            fontSize: 13, color: 'var(--zr-text)', width: '100%',
          }}
        />
        <kbd style={{
          fontSize: 10, color: 'var(--zr-muted-light)', border: '1px solid var(--zr-border)',
          borderRadius: 4, padding: '1px 5px', fontFamily: 'inherit', background: 'var(--zr-white)',
          flexShrink: 0,
        }}>⏎</kbd>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, position: 'relative' }} ref={dropdownRef}>
        {/* Notification Bell Button */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            fetchNotifications();
          }}
          style={{
            width: 36, height: 36, borderRadius: 7,
            background: showNotifications ? 'var(--zr-blue-light)' : 'transparent',
            border: `1px solid ${showNotifications ? 'var(--zr-blue)' : 'var(--zr-border)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: showNotifications ? 'var(--zr-blue)' : 'var(--zr-muted)',
            transition: 'all 0.15s', position: 'relative',
          }}
          title="Notifications Center"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3,
              minWidth: 16, height: 16, borderRadius: 8,
              background: 'var(--zr-orange)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--zr-white)',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* ══ REAL-TIME NOTIFICATION DRAWER / DROPDOWN ══ */}
        {showNotifications && (
          <div
            style={{
              position: 'absolute',
              top: 46,
              right: 0,
              width: 380,
              background: 'var(--zr-white)',
              border: '1px solid var(--zr-border)',
              borderRadius: 10,
              boxShadow: 'var(--zr-shadow-lg)',
              zIndex: 300,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease',
            }}
          >
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--zr-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="zr-badge zr-badge-orange" style={{ fontSize: 10 }}>{unreadCount} new</span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none', border: 'none', fontSize: 11, color: 'var(--zr-blue)',
                    fontWeight: 600, cursor: 'pointer', padding: 0,
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: 'var(--zr-bg)', padding: '6px 12px', gap: 6, borderBottom: '1px solid var(--zr-border-light)' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'ats', label: '⭐ ATS' },
                { id: 'payroll', label: '🚪 Payroll' },
                { id: 'offers', label: '📝 Offers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: filterType === tab.id ? 700 : 500,
                    color: filterType === tab.id ? 'var(--zr-blue)' : 'var(--zr-muted)',
                    background: filterType === tab.id ? 'var(--zr-white)' : 'transparent',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    boxShadow: filterType === tab.id ? 'var(--zr-shadow-sm)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {filteredNotifications.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--zr-muted)', fontSize: 12 }}>
                  ✨ All caught up! No unread notifications.
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const meta = TYPE_ICONS[n.type] || TYPE_ICONS.general;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--zr-border-light)',
                        background: n.isRead ? 'transparent' : 'rgba(20,115,230,0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 12,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--zr-bg)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = n.isRead ? 'transparent' : 'rgba(20,115,230,0.03)')}
                    >
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 15, flexShrink: 0,
                        }}
                      >
                        {meta.icon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                          <div style={{ fontSize: 12, fontWeight: n.isRead ? 600 : 700, color: 'var(--zr-text)', lineHeight: 1.3 }}>
                            {n.title}
                          </div>
                          {!n.isRead && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--zr-blue)', flexShrink: 0, marginTop: 4 }} />
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 3, lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer link to relevant hubs */}
            <div style={{ padding: '8px 16px', background: 'var(--zr-bg)', borderTop: '1px solid var(--zr-border-light)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <Link href="/sourcing/inbox" onClick={() => setShowNotifications(false)} style={{ color: 'var(--zr-blue)', textDecoration: 'none', fontWeight: 600 }}>
                Resume Inbox →
              </Link>
              <Link href="/payroll-mobility" onClick={() => setShowNotifications(false)} style={{ color: 'var(--zr-blue)', textDecoration: 'none', fontWeight: 600 }}>
                Mobility &amp; Succession →
              </Link>
            </div>
          </div>
        )}

        {/* Help */}
        <button style={{
          width: 36, height: 36, borderRadius: 7,
          background: 'transparent', border: '1px solid var(--zr-border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--zr-muted)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--zr-bg)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--zr-text)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--zr-muted)';
          }}
          title="Help"
        >
          <HelpIcon />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--zr-border)', margin: '0 6px' }} />

        {/* User Avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 5px',
          borderRadius: 8,
          border: '1px solid var(--zr-border)',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--zr-bg)'}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--zr-orange) 0%, #FF8C5A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>HR</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--zr-text)', lineHeight: 1.3 }}>HR Manager</div>
            <div style={{ fontSize: 10, color: 'var(--zr-muted)', lineHeight: 1.3 }}>Admin</div>
          </div>
          <ChevronDown />
        </div>
      </div>
    </header>
  );
}
