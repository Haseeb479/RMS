'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server. Please check your NEXT_PUBLIC_API_URL or verify backend is running.');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@rms.com');
    setPassword('demo1234');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zr-bg)',
      color: 'var(--zr-text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--zr-orange)',
            borderRadius: '10px',
            margin: '0 auto 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '800',
            fontSize: '22px',
            boxShadow: 'var(--zr-shadow-md)',
          }}>
            R
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: 'var(--zr-navy)',
            marginBottom: '6px',
            letterSpacing: '-0.4px',
          }}>
            Sign in to RMS Recruit
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--zr-muted)', margin: 0 }}>
            Talent Acquisition & Applicant Tracking Suite
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--zr-white)',
          border: '1px solid var(--zr-border)',
          borderRadius: 'var(--zr-radius-lg)',
          padding: '28px',
          boxShadow: 'var(--zr-shadow-md)',
          marginBottom: '16px',
        }}>

          {error && (
            <div style={{
              background: 'var(--zr-danger-light)',
              border: '1px solid var(--zr-danger)',
              borderRadius: 'var(--zr-radius)',
              padding: '10px 14px',
              color: 'var(--zr-danger)',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: '500',
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="zr-form-group" style={{ marginBottom: 0 }}>
              <label className="zr-label">Work Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="zr-input"
              />
            </div>

            <div className="zr-form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="zr-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: 'var(--zr-blue)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="zr-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="zr-btn zr-btn-primary"
              style={{ padding: '12px', fontSize: '14px', justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.65 : 1 }}
            >
              {loading ? 'Signing In...' : 'Sign In to Dashboard →'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--zr-border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--zr-muted)' }}>Quick test login:</span>
            <button
              type="button"
              onClick={fillDemo}
              className="zr-btn zr-btn-outline zr-btn-xs"
            >
              ⚡ Fill Demo Account
            </button>
          </div>

        </div>

        {/* Signup Link Footer */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--zr-muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--zr-blue)', fontWeight: '600', textDecoration: 'none' }}>
            Create company account
          </Link>
        </div>

      </div>
    </div>
  );
}