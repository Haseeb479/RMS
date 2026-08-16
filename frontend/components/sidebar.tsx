'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobileNav } from '@/lib/use-mobile-nav';

/* ── SVG Icon set ── */
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Candidates: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Jobs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  Applications: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Interviews: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Offers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  Workflows: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  AuditLogs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  Inbox: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Sourcing: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  CareerSite: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Tasks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Team: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Mobility: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  Payroll: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <circle cx="7" cy="15" r="1"/>
      <circle cx="12" cy="15" r="1"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  SignOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { icon: Icons.Dashboard,     label: 'Dashboard',     href: '/dashboard' },
      { icon: Icons.Analytics,     label: 'Executive Analytics & BI', href: '/analytics' },
      { icon: Icons.Candidates,    label: 'Candidates',    href: '/candidates' },
      { icon: Icons.Payroll,       label: 'Demo Payroll (120+)', href: '/payroll' },
      { icon: Icons.Inbox,         label: 'Resume Inbox',  href: '/sourcing/inbox' },
      { icon: Icons.Search,        label: 'Resume Search', href: '/candidates/search' },
    ],
  },
  {
    label: 'RECRUITMENT & SOURCING',
    items: [
      { icon: Icons.Jobs,          label: 'Job Openings',  href: '/jobs' },
      { icon: Icons.Sourcing,      label: 'Sourcing & Feeds', href: '/jobs/sourcing' },
      { icon: Icons.Mobility,      label: 'Succession & Mobility', href: '/payroll-mobility' },
      { icon: Icons.Applications,  label: 'Applications',  href: '/applications' },
      { icon: Icons.Interviews,    label: 'Interviews',    href: '/interviews' },
      { icon: Icons.Tasks,         label: 'Tasks & To-Dos', href: '/tasks' },
      { icon: Icons.Offers,        label: 'Offer Letters', href: '/offers' },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { icon: Icons.Team,          label: 'Team & Roles',  href: '/settings/team' },
      { icon: Icons.CareerSite,    label: 'Career Site Builder', href: '/settings/career-site' },
      { icon: Icons.Workflows,     label: 'Workflows',     href: '/settings/workflows' },
      { icon: Icons.AuditLogs,     label: 'Audit Logs',    href: '/settings/audit' },
      { icon: Icons.Settings,      label: 'Company',       href: '/settings/company' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="zr-mobile-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 30, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 2050,
          }}
        />
      )}

      <aside
        className={`zr-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 'var(--zr-sidebar-w)',
          background: 'var(--zr-navy)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2100,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo area */}
        <div style={{
          height: 'var(--zr-topnav-h)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #E8652A 0%, #FF8C5A 100%)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 12,
              letterSpacing: '0.5px', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(232,101,42,0.45)',
            }}>RMS</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 0.2, lineHeight: 1.2 }}>
                Recruit Pro
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 400, marginTop: 1 }}>
                Management System
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={close}
            className="zr-mobile-close-btn"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              width: 30,
              height: 30,
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

      {/* Navigation sections */}
      <nav style={{ flex: 1, padding: '8px 0 16px' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 2 }}>
            <div style={{
              padding: '16px 18px 5px',
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={close}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 14px',
                    margin: '1px 8px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    background: active ? 'rgba(232,101,42,0.15)' : 'transparent',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    }}
                  >
                    {/* Active indicator */}
                    {active && (
                      <span style={{
                        position: 'absolute',
                        left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3, height: 20,
                        borderRadius: '0 3px 3px 0',
                        background: '#E8652A',
                      }} />
                    )}
                    <span style={{
                      color: active ? '#E8652A' : 'rgba(255,255,255,0.45)',
                      flexShrink: 0,
                      transition: 'color 0.15s',
                      display: 'flex',
                    }}>
                      <IconComponent />
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                      transition: 'color 0.15s',
                    }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user area */}
      <div style={{
        padding: '10px 8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <Link href="/auth/login" onClick={close}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 10px', borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8652A 0%, #FF8C5A 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(232,101,42,0.35)',
            }}>HR</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>HR Manager</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>Sign Out</div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
              <Icons.SignOut />
            </span>
          </div>
        </Link>
      </div>
    </aside>
  </>
  );
}