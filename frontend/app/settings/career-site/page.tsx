'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { useCareerSite, CareerPerk, SocialLinks } from '@/lib/hooks/usecareersite';
import Link from 'next/link';

const COLOR_PRESETS = [
  { name: 'Zoho Orange', color: '#E8652A' },
  { name: 'Royal Blue', color: '#1473E6' },
  { name: 'Emerald', color: '#27AE60' },
  { name: 'Amethyst', color: '#8B5CF6' },
  { name: 'Midnight', color: '#1A223D' },
  { name: 'Crimson', color: '#E74C3C' },
];

const DEFAULT_PERKS: CareerPerk[] = [
  { id: '1', icon: '🌐', title: 'Remote & Hybrid Friendly', desc: 'Flexible work options with international team members' },
  { id: '2', icon: '🩺', title: 'Comprehensive Healthcare', desc: 'Full medical, dental, and wellness coverage' },
  { id: '3', icon: '🚀', title: 'Growth & Learning Stipend', desc: '$1,500/year annual education and conference budget' },
  { id: '4', icon: '🏖️', title: 'Unlimited Paid Time Off', desc: 'Generous time-off policy to recharge and stay creative' },
];

export default function CareerSiteBuilderPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { settings, loading, error, fetchSettings, updateSettings } = useCareerSite();

  const [careerHeadline, setCareerHeadline] = useState('Build the future with us');
  const [careerSubtitle, setCareerSubtitle] = useState('Explore open opportunities and grow your career with our passionate team.');
  const [careerColor, setCareerColor] = useState('#E8652A');
  const [careerBanner, setCareerBanner] = useState('');
  const [perks, setPerks] = useState<CareerPerk[]>(DEFAULT_PERKS);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ linkedin: '', twitter: '', github: '', website: '' });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    fetchSettings();
  }, [isLoggedIn, router, fetchSettings]);

  useEffect(() => {
    if (settings) {
      if (settings.careerHeadline) setCareerHeadline(settings.careerHeadline);
      if (settings.careerSubtitle) setCareerSubtitle(settings.careerSubtitle);
      if (settings.careerColor) setCareerColor(settings.careerColor);
      if (settings.careerBanner) setCareerBanner(settings.careerBanner);
      if (Array.isArray(settings.careerPerks) && settings.careerPerks.length > 0) {
        setPerks(settings.careerPerks);
      }
      if (settings.socialLinks && typeof settings.socialLinks === 'object') {
        setSocialLinks(settings.socialLinks as SocialLinks);
      }
    }
  }, [settings]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess('');
      await updateSettings({
        careerHeadline,
        careerSubtitle,
        careerColor,
        careerBanner,
        careerPerks: perks,
        socialLinks,
      });
      setSaveSuccess('✓ Career site branding and layout saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addPerk = () => {
    setPerks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        icon: '⭐',
        title: 'New Benefit',
        desc: 'Benefit description...',
      },
    ]);
  };

  const removePerk = (id: string) => {
    setPerks((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePerk = (id: string, field: keyof CareerPerk, val: string) => {
    setPerks((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const publicPortalUrl = settings?.slug ? `/careers/${settings.slug}` : '/careers/demo-tech';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Career Site Builder</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Customize your public recruitment portal, brand styling, company culture perks, and banner
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href={publicPortalUrl} target="_blank">
              <button className="zr-btn zr-btn-outline zr-btn-sm">
                🌐 View Public Site ↗
              </button>
            </Link>
          </div>
        </div>

        <div className="zr-content">
          {saveSuccess && (
            <div style={{
              background: 'var(--zr-success-light)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              borderRadius: 'var(--zr-radius)',
              padding: '12px 16px',
              marginBottom: '16px',
              color: 'var(--zr-success)',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              {saveSuccess}
            </div>
          )}

          {saveError && (
            <div style={{
              background: 'var(--zr-danger-light)',
              border: '1px solid var(--zr-danger)',
              borderRadius: 'var(--zr-radius)',
              padding: '12px 16px',
              marginBottom: '16px',
              color: 'var(--zr-danger)',
              fontSize: '13px',
            }}>
              ⚠ {saveError}
            </div>
          )}

          {/* Split Screen: Left Editor & Right Live Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) minmax(460px, 1.2fr)', gap: '20px', alignItems: 'start' }}>
            
            {/* Left: Customizer Controls */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Brand Color Theme Card */}
              <div className="zr-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '12px' }}>
                  🎨 Brand Accent Color
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setCareerColor(preset.color)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: `2px solid ${careerColor === preset.color ? preset.color : 'var(--zr-border)'}`,
                        background: careerColor === preset.color ? `${preset.color}15` : 'var(--zr-white)',
                        color: 'var(--zr-text)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: preset.color }} />
                      {preset.name}
                    </button>
                  ))}
                </div>

                <div className="zr-form-group" style={{ marginBottom: 0 }}>
                  <label className="zr-label">Custom HEX Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={careerColor}
                      onChange={(e) => setCareerColor(e.target.value)}
                      style={{ width: '40px', height: '36px', border: '1px solid var(--zr-border)', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                    />
                    <input
                      type="text"
                      value={careerColor}
                      onChange={(e) => setCareerColor(e.target.value)}
                      className="zr-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Hero Banner Content Card */}
              <div className="zr-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '12px' }}>
                  🏢 Hero Header & Messaging
                </h3>

                <div className="zr-form-group">
                  <label className="zr-label">Main Headline</label>
                  <input
                    type="text"
                    value={careerHeadline}
                    onChange={(e) => setCareerHeadline(e.target.value)}
                    placeholder="e.g. Build the future with us"
                    required
                    className="zr-input"
                  />
                </div>

                <div className="zr-form-group">
                  <label className="zr-label">Subheadline / Pitch</label>
                  <textarea
                    value={careerSubtitle}
                    onChange={(e) => setCareerSubtitle(e.target.value)}
                    rows={3}
                    placeholder="Describe your company mission and what it's like to work here..."
                    className="zr-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="zr-form-group" style={{ marginBottom: 0 }}>
                  <label className="zr-label">Header Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    value={careerBanner}
                    onChange={(e) => setCareerBanner(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-... or leave blank for gradient"
                    className="zr-input"
                  />
                </div>
              </div>

              {/* Company Perks & Culture Benefits */}
              <div className="zr-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', margin: 0 }}>
                    🎁 Culture Perks & Benefits ({perks.length})
                  </h3>
                  <button
                    type="button"
                    onClick={addPerk}
                    className="zr-btn zr-btn-outline zr-btn-xs"
                  >
                    + Add Benefit
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {perks.map((perk) => (
                    <div
                      key={perk.id}
                      style={{
                        background: 'var(--zr-bg)',
                        border: '1px solid var(--zr-border)',
                        borderRadius: 'var(--zr-radius)',
                        padding: '10px 12px',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        value={perk.icon}
                        onChange={(e) => updatePerk(perk.id, 'icon', e.target.value)}
                        style={{ width: '36px', textAlign: 'center', fontSize: '16px', background: 'var(--zr-white)', border: '1px solid var(--zr-border)', borderRadius: '6px', padding: '4px' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="text"
                          value={perk.title}
                          onChange={(e) => updatePerk(perk.id, 'title', e.target.value)}
                          placeholder="Perk Title"
                          className="zr-input"
                          style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '600' }}
                        />
                        <input
                          type="text"
                          value={perk.desc}
                          onChange={(e) => updatePerk(perk.id, 'desc', e.target.value)}
                          placeholder="Short description"
                          className="zr-input"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePerk(perk.id)}
                        className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                        title="Remove perk"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Channels Card */}
              <div className="zr-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '12px' }}>
                  🔗 Social Media Profiles
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="zr-form-group">
                    <label className="zr-label">LinkedIn Page</label>
                    <input
                      type="url"
                      value={socialLinks.linkedin || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/..."
                      className="zr-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="zr-form-group">
                    <label className="zr-label">Twitter / X</label>
                    <input
                      type="url"
                      value={socialLinks.twitter || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://x.com/..."
                      className="zr-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="zr-form-group" style={{ marginBottom: 0 }}>
                    <label className="zr-label">GitHub</label>
                    <input
                      type="url"
                      value={socialLinks.github || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/..."
                      className="zr-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="zr-form-group" style={{ marginBottom: 0 }}>
                    <label className="zr-label">Main Website</label>
                    <input
                      type="url"
                      value={socialLinks.website || ''}
                      onChange={(e) => setSocialLinks((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://mycompany.com"
                      className="zr-input"
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="zr-btn zr-btn-primary"
                style={{ padding: '14px', fontSize: '14px', justifyContent: 'center', opacity: saving ? 0.65 : 1 }}
              >
                {saving ? 'Publishing Changes...' : '🚀 Save & Publish Career Site'}
              </button>
            </form>

            {/* Right: Real-time Split Screen Live Preview */}
            <div style={{ position: 'sticky', top: '76px' }}>
              <div style={{
                background: 'var(--zr-white)',
                border: '1px solid var(--zr-border)',
                borderRadius: 'var(--zr-radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--zr-shadow-md)',
              }}>
                {/* Browser Mockup Header Bar */}
                <div style={{
                  background: 'var(--zr-bg)',
                  borderBottom: '1px solid var(--zr-border)',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E74C3C' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F39C12' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />
                  <div style={{
                    flex: 1,
                    background: 'var(--zr-white)',
                    borderRadius: '4px',
                    padding: '2px 10px',
                    fontSize: '11px',
                    color: 'var(--zr-muted)',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}>
                    rms-recruit.com{publicPortalUrl}
                  </div>
                </div>

                {/* Simulated Portal Content */}
                <div style={{ maxHeight: '680px', overflowY: 'auto', background: '#FAFAFA' }}>
                  {/* Hero Banner Preview */}
                  <div style={{
                    background: careerBanner
                      ? `linear-gradient(rgba(26,34,61,0.75), rgba(26,34,61,0.85)), url(${careerBanner}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${careerColor} 0%, #1A223D 100%)`,
                    padding: '36px 20px',
                    textAlign: 'center',
                    color: '#FFFFFF',
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      color: careerColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: 20,
                      margin: '0 auto 12px',
                    }}>
                      {settings?.name?.[0] || 'C'}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0' }}>
                      {careerHeadline}
                    </h2>
                    <p style={{ fontSize: '12px', opacity: 0.9, maxWidth: '380px', margin: '0 auto 14px', lineHeight: '1.4' }}>
                      {careerSubtitle}
                    </p>
                    <div style={{ display: 'inline-block', background: careerColor, color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                      Explore Open Positions ↓
                    </div>
                  </div>

                  {/* Culture Perks Preview */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '10px' }}>
                      Why Join Us
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                      {perks.slice(0, 4).map((p) => (
                        <div key={p.id} style={{ background: '#FFFFFF', border: '1px solid var(--zr-border)', borderRadius: '6px', padding: '8px' }}>
                          <span style={{ fontSize: '14px' }}>{p.icon}</span>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--zr-text)', marginTop: '2px' }}>{p.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--zr-muted)', marginTop: '2px' }}>{p.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Job Openings List Preview */}
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '10px' }}>
                      Live Openings (Sample)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { title: 'Senior Full Stack Engineer', dept: 'Engineering', loc: 'Remote / US' },
                        { title: 'Product Marketing Lead', dept: 'Marketing', loc: 'New York, NY' },
                      ].map((j, i) => (
                        <div key={i} style={{ background: '#FFFFFF', border: '1px solid var(--zr-border)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--zr-text)' }}>{j.title}</div>
                            <div style={{ fontSize: '10px', color: 'var(--zr-muted)', marginTop: '2px' }}>📍 {j.loc} · {j.dept}</div>
                          </div>
                          <button
                            type="button"
                            style={{ background: careerColor, color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: '700' }}
                          >
                            Apply Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
