'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { useJobs } from '@/lib/hooks/usejobs';
import { useCompany } from '@/lib/hooks/usecompany';

export default function JobSourcingHubPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { jobs, fetchJobs } = useJobs('published');
  const { company } = useCompany();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [utmSource, setUtmSource] = useState('linkedin');
  const [utmCampaign, setUtmCampaign] = useState('talent_sourcing_2026');
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [copiedUtmLink, setCopiedUtmLink] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    fetchJobs();
  }, [isLoggedIn, router, fetchJobs]);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'var(--zr-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--zr-muted)', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  const hostOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiOrigin = hostOrigin.includes(':3000') ? hostOrigin.replace(':3000', ':5000') : hostOrigin;
  const companySlug = company?.slug || 'demo-tech';

  const indeedFeedUrl = `${apiOrigin}/api/public/feeds/indeed/${companySlug}.xml`;
  const zipRecruiterFeedUrl = `${apiOrigin}/api/public/feeds/ziprecruiter/${companySlug}.xml`;
  const careersUrl = `${hostOrigin}/careers/${companySlug}`;

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];
  const generatedCampaignUrl = selectedJob
    ? `${hostOrigin}/apply/${selectedJob.id}?utm_source=${utmSource}&utm_campaign=${encodeURIComponent(utmCampaign)}`
    : careersUrl;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeed(key);
    setTimeout(() => setCopiedFeed(null), 2000);
  };

  const copyUtmLink = () => {
    navigator.clipboard.writeText(generatedCampaignUrl);
    setCopiedUtmLink(true);
    setTimeout(() => setCopiedUtmLink(false), 2000);
  };

  const handleShare = (platform: 'linkedin' | 'twitter' | 'whatsapp') => {
    if (!selectedJob) return;
    const title = encodeURIComponent(`We are hiring: ${selectedJob.title} at ${company?.name || 'our team'}! Apply online:`);
    const url = encodeURIComponent(generatedCampaignUrl);

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Sub-header */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Job Sourcing & Distribution Hub</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Syndicate job openings to Indeed, ZipRecruiter, Google for Jobs, and generate tracked social campaigns
            </p>
          </div>
        </div>

        <div className="zr-content">

          {/* Metric Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
          }}>
            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                📢
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Openings Syndicated</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-text)', marginTop: 2 }}>{jobs.length}</div>
              </div>
            </div>

            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                🌐
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Board Feeds</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-orange)', marginTop: 2 }}>4 Active</div>
              </div>
            </div>

            <div className="zr-stat-card" style={{ padding: '16px 18px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--zr-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                ✓
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Google Jobs Indexing</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--zr-success)', marginTop: 2 }}>Schema Active</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>

            {/* Left Card: Aggregator XML Feeds */}
            <div className="zr-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>📡</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', margin: 0 }}>
                    Aggregator XML Feeds & Syndication
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    Connect your ATS directly to national job search engines
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Indeed XML */}
                <div style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 'var(--zr-radius)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#2164f3' }}>●</span> Indeed XML Feed (Auto-Crawler Ready)
                    </div>
                    <span className="zr-badge zr-badge-blue">XML 2.0</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--zr-muted)', marginBottom: '8px' }}>
                    Standard XML feed specification ingested by Indeed Job Search bots.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={indeedFeedUrl}
                      className="zr-input"
                      style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--zr-blue)' }}
                    />
                    <button
                      onClick={() => copyText(indeedFeedUrl, 'indeed')}
                      className="zr-btn zr-btn-primary zr-btn-xs"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {copiedFeed === 'indeed' ? '✓ Copied' : 'Copy Feed'}
                    </button>
                    <a href={indeedFeedUrl} target="_blank" rel="noopener noreferrer">
                      <button className="zr-btn zr-btn-outline zr-btn-xs">
                        View ↗
                      </button>
                    </a>
                  </div>
                </div>

                {/* ZipRecruiter XML */}
                <div style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 'var(--zr-radius)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#27AE60' }}>●</span> ZipRecruiter Partner Feed
                    </div>
                    <span className="zr-badge zr-badge-green">Partner XML</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--zr-muted)', marginBottom: '8px' }}>
                    XML structure mapped to ZipRecruiter partner distribution requirements.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value={zipRecruiterFeedUrl}
                      className="zr-input"
                      style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--zr-success)' }}
                    />
                    <button
                      onClick={() => copyText(zipRecruiterFeedUrl, 'zip')}
                      className="zr-btn zr-btn-primary zr-btn-xs"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {copiedFeed === 'zip' ? '✓ Copied' : 'Copy Feed'}
                    </button>
                    <a href={zipRecruiterFeedUrl} target="_blank" rel="noopener noreferrer">
                      <button className="zr-btn zr-btn-outline zr-btn-xs">
                        View ↗
                      </button>
                    </a>
                  </div>
                </div>

                {/* Google for Jobs */}
                <div style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 'var(--zr-radius)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zr-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#F39C12' }}>●</span> Google for Jobs (Schema.org JSON-LD)
                    </div>
                    <span className="zr-badge zr-badge-orange">Direct Indexing</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--zr-muted)', margin: 0 }}>
                    Every public job application link automatically renders embedded Schema.org <code style={{ color: 'var(--zr-blue)' }}>JobPosting</code> JSON-LD for instant search card indexing.
                  </p>
                </div>

              </div>
            </div>

            {/* Right Card: Custom UTM Campaign Link Generator & Social Broadcaster */}
            <div className="zr-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '20px' }}>🔗</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--zr-text)', margin: 0 }}>
                    Tracked Campaign Link Generator
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    Generate campaign tracking links with UTM sources for marketing
                  </p>
                </div>
              </div>

              {jobs.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--zr-muted)' }}>
                  Publish a job opening to create custom campaign links.
                </p>
              ) : (
                <div>
                  <div className="zr-form-group">
                    <label className="zr-label">Target Job Opening</label>
                    <select
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="zr-input"
                    >
                      {jobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} {j.location ? `(${j.location})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="zr-form-group">
                      <label className="zr-label">Sourcing Channel</label>
                      <select
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="zr-input"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="indeed">Indeed</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="facebook">Facebook</option>
                        <option value="whatsapp">WhatsApp Outreach</option>
                        <option value="newsletter">Email Newsletter</option>
                        <option value="referral">Employee Referral</option>
                      </select>
                    </div>

                    <div className="zr-form-group">
                      <label className="zr-label">Campaign Tag</label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="e.g. q3_engineering_drive"
                        className="zr-input"
                      />
                    </div>
                  </div>

                  {/* Generated Tracked Link */}
                  <div className="zr-form-group">
                    <label className="zr-label">Tracked Application URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={generatedCampaignUrl}
                        className="zr-input"
                        style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--zr-blue)' }}
                      />
                      <button
                        onClick={copyUtmLink}
                        className="zr-btn zr-btn-primary zr-btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {copiedUtmLink ? '✓ Copied' : 'Copy URL'}
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Social Sharing */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--zr-border-light)' }}>
                    <label className="zr-label" style={{ marginBottom: '8px' }}>1-Click Social Broadcasting</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="zr-btn zr-btn-xs"
                        style={{ background: '#0a66c2', color: '#fff', border: 'none' }}
                      >
                        💼 Post to LinkedIn
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="zr-btn zr-btn-xs"
                        style={{ background: '#000000', color: '#fff', border: 'none' }}
                      >
                        𝕏 Share on X
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="zr-btn zr-btn-xs"
                        style={{ background: '#25D366', color: '#fff', border: 'none' }}
                      >
                        💬 Share on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
