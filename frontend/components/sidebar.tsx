'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    { icon: '👥', label: 'Candidates', href: '/candidates' },
    { icon: '📋', label: 'Jobs', href: '/jobs' },
    { icon: '📤', label: 'Applications', href: '/applications' },
    { icon: '🎥', label: 'Interviews', href: '/interviews' },
    { icon: '⚙️', label: 'Settings', href: '/settings/company' },
  ];

  return (
    <aside style={{
      width: '240px',
      background: '#0f172a',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      overflowY: 'auto',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        paddingLeft: '4px',
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '800',
          fontSize: '15px',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          letterSpacing: '0.5px',
        }}>
          RMS
        </div>
        <div>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#f8fafc',
            letterSpacing: '0.5px',
            display: 'block',
          }}>
            RMS
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            Recruitment Portal
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                marginBottom: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
                paddingLeft: '13px',
                transition: 'all 0.2s ease',
                color: isActive ? '#a5b4fc' : '#94a3b8',
                boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <Link href="/auth/login">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}