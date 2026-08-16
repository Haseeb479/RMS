'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

export default function CompanySettingsPage() {
  const { isLoggedIn } = useAuth();
  const { company, updateCompany } = useCompany();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        website: company.website || '',
        description: company.description || '',
      });
    }
  }, [company]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateCompany(formData);
      setSuccess('Company profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="zr-subheader-title">Company Settings</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Manage your organization information and public career branding
            </p>
          </div>
        </div>

        <div className="zr-content">
          <div className="zr-card" style={{ maxWidth: '640px' }}>
            <div className="zr-card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)' }}>
                Organization Profile
              </h3>
              <span className="zr-badge zr-badge-blue">Public Branding</span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {success && (
                <div style={{
                  background: 'var(--zr-success-light)',
                  border: '1px solid rgba(39, 174, 96, 0.3)',
                  borderRadius: 'var(--zr-radius)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: 'var(--zr-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                }}>
                  ✓ {success}
                </div>
              )}

              {error && (
                <div style={{
                  background: 'var(--zr-danger-light)',
                  border: '1px solid var(--zr-danger)',
                  borderRadius: 'var(--zr-radius)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: 'var(--zr-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* Company Name */}
              <div className="zr-form-group">
                <label className="zr-label">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  className="zr-input"
                  required
                />
              </div>

              {/* Website */}
              <div className="zr-form-group">
                <label className="zr-label">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="zr-input"
                />
              </div>

              {/* Description */}
              <div className="zr-form-group" style={{ marginBottom: 24 }}>
                <label className="zr-label">
                  Company Overview & Mission
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell candidates about your company culture, mission, and work environment..."
                  className="zr-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="zr-btn zr-btn-primary"
                  style={{ opacity: saving ? 0.65 : 1 }}
                >
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}