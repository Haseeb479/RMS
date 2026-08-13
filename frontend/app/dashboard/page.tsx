'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import Sidebar from '@/components/sidebar';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const { company } = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#f8fafc',
            }}>
              Dashboard
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              👤
            </div>
            <span style={{
              fontSize: '13px',
              color: '#94a3b8',
              fontWeight: '500',
            }}>
              Admin
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}>
              Good day, Admin 👋
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
            }}>
              {company?.name ? `${company.name} Recruitment Hub` : 'Welcome to RMS Recruitment Management'}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {/* Stat 1 */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>
                Active Jobs
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#f8fafc',
                }}>
                  0
                </p>
                <span style={{ fontSize: '24px' }}>📋</span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
              }}>
                +0% from last month
              </p>
            </div>

            {/* Stat 2 */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>
                Total Candidates
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#f8fafc',
                }}>
                  0
                </p>
                <span style={{ fontSize: '24px' }}>👥</span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
              }}>
                +0% from last month
              </p>
            </div>

            {/* Stat 3 */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>
                Applications
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#f8fafc',
                }}>
                  0
                </p>
                <span style={{ fontSize: '24px' }}>📊</span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
              }}>
                +0% from last month
              </p>
            </div>

            {/* Stat 4 */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>
                Interviews
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#f8fafc',
                }}>
                  0
                </p>
                <span style={{ fontSize: '24px' }}>🎥</span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '8px',
              }}>
                +0% from this week
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#f8fafc',
              marginBottom: '16px',
            }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
            }}>
              <Link href="/jobs">
                <div style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#f8fafc',
                        marginBottom: '4px',
                      }}>
                        Post a Job
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                      }}>
                        Create a new job posting
                      </p>
                    </div>
                    <span style={{ fontSize: '24px' }}>➕</span>
                  </div>
                </div>
              </Link>

              <Link href="/candidates">
                <div style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#f8fafc',
                        marginBottom: '4px',
                      }}>
                        Add Candidate
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                      }}>
                        Add to your talent pool
                      </p>
                    </div>
                    <span style={{ fontSize: '24px' }}>➕</span>
                  </div>
                </div>
              </Link>

              <Link href="/applications">
                <div style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#f8fafc',
                        marginBottom: '4px',
                      }}>
                        View Pipeline
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#94a3b8',
                      }}>
                        Manage your applications
                      </p>
                    </div>
                    <span style={{ fontSize: '24px' }}>🔍</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#f8fafc',
              }}>
                Recent Activity
              </h3>
            </div>
            <div style={{ padding: '32px 24px' }}>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                textAlign: 'center',
              }}>
                No recent activity yet. Post a job or add candidates to get started!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}