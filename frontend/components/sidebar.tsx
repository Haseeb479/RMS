'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
    <div style={{
      width: '240px',
      background: '#ffffff',
      borderRight: '1px solid #e5e5e3',
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
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: '#3b82f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '16px',
        }}>
          RMS
        </div>
        <span style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1a1a1a',
        }}>
          RMS
        </span>
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
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isActive ? '#eff6ff' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                paddingLeft: '13px',
                transition: 'all 0.2s ease',
                color: isActive ? '#3b82f6' : '#666',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#3b82f6' : '#666',
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
        borderTop: '1px solid #e5e5e3',
      }}>
        <Link href="/auth/login">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#666',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}>
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>Logout</span>
          </div>
        </Link>
      </div>
    </div>
  );
}