'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import Sidebar from '@/components/sidebar';

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

  // Load company data into form
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
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f8fafc' }}>
            Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#1e293b',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}>
              👤
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Admin</span>
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
            }}>
              Company Settings
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Manage your company information
            </p>
          </div>

          {/* Settings Card */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            maxWidth: '600px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}>
            {/* Card Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#f8fafc',
              }}>
                Company Profile
              </h3>
            </div>

            {/* Card Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Success Message */}
              {success && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  ✅ {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Company Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#cbd5e1',
                }}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              {/* Website */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#cbd5e1',
                }}>
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://mycompany.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#cbd5e1',
                }}>
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your company..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    minHeight: '120px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '6px',
                }}>
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: saving ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Company Info Card */}
          {company && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '24px',
              maxWidth: '600px',
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#a5b4fc',
                marginBottom: '12px',
              }}>
                ℹ️ Company Information
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                fontSize: '13px',
              }}>
                <div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Company ID</p>
                  <p style={{ color: '#f8fafc', fontFamily: 'monospace', fontSize: '12px' }}>
                    {company.id.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <p style={{ color: '#64748b', marginBottom: '4px' }}>Created</p>
                  <p style={{ color: '#f8fafc' }}>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}