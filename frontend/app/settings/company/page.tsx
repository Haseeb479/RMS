'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    logo: '',
    careerHeadline: '',
    careerSubtitle: '',
    careerColor: '#E8652A',
    careerPerks: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (company) {
      let perksStr = '';
      try {
        if (company.careerPerks) {
          const parsed = JSON.parse(company.careerPerks);
          perksStr = Array.isArray(parsed) ? parsed.join(', ') : company.careerPerks;
        }
      } catch {
        perksStr = company.careerPerks || '';
      }

      setFormData({
        name: company.name || '',
        website: company.website || '',
        description: company.description || '',
        logo: company.logo || '',
        careerHeadline: company.careerHeadline || 'Build the future with us',
        careerSubtitle: company.careerSubtitle || 'Explore open opportunities and grow your career with our team',
        careerColor: company.careerColor || '#E8652A',
        careerPerks: perksStr,
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

  const handleCopySlug = () => {
    if (typeof window !== 'undefined' && company?.slug) {
      const fullUrl = `${window.location.origin}/careers/${company.slug}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const perksArray = formData.careerPerks
        ? formData.careerPerks.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await updateCompany({
        ...formData,
        careerPerks: JSON.stringify(perksArray),
      });

      setSuccess('✓ Company profile and career branding updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  const portalSlug = company?.slug || '';
  const portalUrl = portalSlug ? `/careers/${portalSlug}` : '/careers';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Organization Settings</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Manage your company information, public career branding, and recruitment parameters
            </p>
          </div>
          {portalSlug && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={handleCopySlug}
                className="zr-btn zr-btn-outline zr-btn-sm"
              >
                {copied ? '✓ Portal Link Copied' : '🔗 Copy Career Link'}
              </button>
              <Link href={portalUrl} target="_blank">
                <button type="button" className="zr-btn zr-btn-blue zr-btn-sm">
                  🌐 Preview Career Site ↗
                </button>
              </Link>
            </div>
          )}
        </div>

        <div className="zr-content" style={{ maxWidth: '820px', margin: '0 auto' }}>
          
          {success && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '12px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 18 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Section 1: General Company Profile */}
            <div className="zr-card">
              <div className="zr-card-header">
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🏢 Company Profile
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--zr-muted)' }}>Primary organizational identification</span>
                </div>
                <span className="zr-badge zr-badge-blue">Core Profile</span>
              </div>

              <div className="zr-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div>
                    <label className="zr-label">Company / Organization Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Acme Corporation"
                      className="zr-input"
                    />
                  </div>

                  <div>
                    <label className="zr-label">Official Website URL</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="zr-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="zr-label">Unique Company Slug (Identifier)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={company?.slug || 'auto-generated'}
                      className="zr-input"
                      style={{ background: 'var(--zr-bg)', color: 'var(--zr-muted)' }}
                    />
                    {portalSlug && (
                      <button
                        type="button"
                        onClick={handleCopySlug}
                        className="zr-btn zr-btn-outline zr-btn-sm"
                        style={{ flexShrink: 0 }}
                      >
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 4, display: 'block' }}>
                    Used for your public career portal link: /careers/{company?.slug || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="zr-label">About the Company / Mission Statement</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your company, what you do, mission, and work culture..."
                    className="zr-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Career Portal Branding */}
            <div className="zr-card">
              <div className="zr-card-header">
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🎨 Public Career Site Branding
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--zr-muted)' }}>Customize how candidates experience your career portal</span>
                </div>
                <span className="zr-badge zr-badge-orange">Public Site</span>
              </div>

              <div className="zr-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="zr-label">Career Site Headline</label>
                  <input
                    type="text"
                    name="careerHeadline"
                    value={formData.careerHeadline}
                    onChange={handleChange}
                    placeholder="e.g. Build the future with our team"
                    className="zr-input"
                  />
                </div>

                <div>
                  <label className="zr-label">Career Site Subtitle</label>
                  <input
                    type="text"
                    name="careerSubtitle"
                    value={formData.careerSubtitle}
                    onChange={handleChange}
                    placeholder="e.g. Explore open positions and grow your career with us"
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  <div>
                    <label className="zr-label">Company Logo Image URL</label>
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="zr-input"
                    />
                  </div>

                  <div>
                    <label className="zr-label">Brand Primary Color</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="color"
                        name="careerColor"
                        value={formData.careerColor}
                        onChange={handleChange}
                        style={{ width: 42, height: 38, padding: 2, border: '1px solid var(--zr-border)', borderRadius: 6, cursor: 'pointer', background: '#fff' }}
                      />
                      <input
                        type="text"
                        name="careerColor"
                        value={formData.careerColor}
                        onChange={handleChange}
                        placeholder="#E8652A"
                        className="zr-input"
                        style={{ width: 120, fontFamily: 'monospace' }}
                      />
                      <div style={{
                        padding: '4px 10px',
                        background: formData.careerColor,
                        color: '#fff',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        Preview
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="zr-label">Employee Perks & Benefits (comma-separated)</label>
                  <input
                    type="text"
                    name="careerPerks"
                    value={formData.careerPerks}
                    onChange={handleChange}
                    placeholder="Health & Dental Insurance, 401(k) Match, Remote Work, Annual Learning Stipend, Flexible PTO"
                    className="zr-input"
                  />
                  <span style={{ fontSize: 11, color: 'var(--zr-muted)', marginTop: 4, display: 'block' }}>
                    Displayed as highlight badges on your public jobs portal to attract top talent.
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 30 }}>
              <button
                type="submit"
                disabled={saving}
                className="zr-btn zr-btn-primary"
                style={{ padding: '10px 24px', fontSize: 14 }}
              >
                {saving ? 'Saving Changes...' : '✓ Save Organization Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}