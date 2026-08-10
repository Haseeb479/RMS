'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCompany } from '@/lib/hooks/usecompany';
import Sidebar from '@/components/sidebar';

export default function CompanySettingsPage() {
  const { isLoggedIn } = useAuth();
  const { company, loading, updateCompany } = useCompany();
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

  if (!isLoggedIn) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf8' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '240px', flex: 1, width: '100%' }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e5e3',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a' }}>
            Settings
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#e5e5e3',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              👤
            </div>
            <span style={{ fontSize: '13px', color: '#666' }}>Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '32px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '8px',
            }}>
              Company Settings
            </h2>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Manage your company information
            </p>
          </div>

          {/* Settings Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e5e3',
            borderRadius: '8px',
            maxWidth: '600px',
          }}>
            {/* Card Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e5e3',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
              }}>
                Company Profile
              </h3>
            </div>

            {/* Card Body */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Success Message */}
              {success && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#047857',
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
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#991b1b',
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
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
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
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
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
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    minHeight: '120px',
                    resize: 'vertical',
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#999',
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
                  padding: '10px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: saving ? 0.6 : 1,
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
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '24px',
              maxWidth: '600px',
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af',
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
                  <p style={{ color: '#999', marginBottom: '4px' }}>Company ID</p>
                  <p style={{ color: '#1a1a1a', fontFamily: 'monospace', fontSize: '12px' }}>
                    {company.id.substring(0, 8)}...
                  </p>
                </div>
                <div>
                  <p style={{ color: '#999', marginBottom: '4px' }}>Created</p>
                  <p style={{ color: '#1a1a1a' }}>
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