'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePublic } from '@/lib/hooks/usepublic';
import Link from 'next/link';

export default function PublicCompanyCareersPage() {
  const params = useParams();
  const companySlug = params?.companySlug as string;
  const { getCompanyCareers } = usePublic();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (!companySlug) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    getCompanyCareers(companySlug)
      .then((res: any) => {
        if (isMounted) setCompany(res);
      })
      .catch((err: any) => {
        if (isMounted) setError(err.message || 'Company careers portal not found.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companySlug]);

  if (loading) {
    return (
      <div style={{ background: '#F0F2F7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667085', fontFamily: "'Inter', sans-serif" }}>
        <p style={{ fontSize: '15px' }}>Loading careers portal...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ background: '#F0F2F7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#101828', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Company Careers Not Found</h2>
        <p style={{ color: '#667085', maxWidth: '440px', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          {error || 'This company career page is unavailable or no longer active.'}
        </p>
      </div>
    );
  }

  const brandColor = company.careerColor || '#E8652A';
  const headline = company.careerHeadline || `Careers at ${company.name}`;
  const subtitle = company.careerSubtitle || company.description || 'Explore open opportunities and build your career with our passionate team.';

  let perksList: any[] = [];
  if (company.careerPerks) {
    try {
      perksList = typeof company.careerPerks === 'string' ? JSON.parse(company.careerPerks) : company.careerPerks;
    } catch {
      perksList = [];
    }
  }

  let social: any = {};
  if (company.socialLinks) {
    try {
      social = typeof company.socialLinks === 'string' ? JSON.parse(company.socialLinks) : company.socialLinks;
    } catch {
      social = {};
    }
  }

  const jobsList = company.jobs || [];

  const filteredJobs = jobsList.filter((j: any) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.location && j.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (j.description && j.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'all' || j.type === selectedType;

    return matchesSearch && matchesType;
  });

  const jobTypes = Array.from(new Set(jobsList.map((j: any) => j.type))).filter(Boolean);

  return (
    <div style={{ background: '#F0F2F7', minHeight: '100vh', color: '#101828', fontFamily: "'Inter', sans-serif" }}>

      {/* Top Navbar */}
      <nav style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #DDE1EC',
        padding: '14px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: brandColor,
            color: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '16px',
          }}>
            {company.name?.[0] || 'C'}
          </div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A223D' }}>
            {company.name} Careers
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px' }}>
          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1473E6', fontWeight: '600', textDecoration: 'none' }}
            >
              Main Website ↗
            </a>
          )}
          <a
            href="#openings"
            style={{
              background: brandColor,
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            View Openings ({jobsList.length})
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header style={{
        background: company.careerBanner
          ? `linear-gradient(rgba(26,34,61,0.75), rgba(26,34,61,0.85)), url(${company.careerBanner}) center/cover no-repeat`
          : `linear-gradient(135deg, ${brandColor} 0%, #1A223D 100%)`,
        padding: '64px 24px',
        textAlign: 'center',
        color: '#FFFFFF',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#FFFFFF',
            color: brandColor,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '28px',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}>
            {company.name?.[0] || 'C'}
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            {headline}
          </h1>

          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', maxWidth: '620px', margin: '0 auto 28px', lineHeight: '1.6' }}>
            {subtitle}
          </p>

          <a
            href="#openings"
            style={{
              display: 'inline-block',
              background: '#FFFFFF',
              color: brandColor,
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Explore Open Positions ↓
          </a>
        </div>
      </header>

      {/* Culture Perks & Benefits Section */}
      {perksList.length > 0 && (
        <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 24px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A223D', margin: '0 0 6px 0' }}>
              Why Build Your Career With Us
            </h2>
            <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
              We invest in our people and provide the environment to do your best work
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {perksList.map((perk: any, i: number) => (
              <div
                key={perk.id || i}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDE1EC',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '24px' }}>{perk.icon || '⭐'}</span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D', margin: '10px 0 4px 0' }}>
                  {perk.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#667085', margin: 0, lineHeight: '1.5' }}>
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Job Openings Section */}
      <main id="openings" style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 64px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1A223D', margin: '0 0 4px 0' }}>
              Current Openings ({jobsList.length})
            </h2>
            <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>
              Join our growing team and make an impact
            </p>
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #DDE1EC',
                borderRadius: '8px',
                padding: '10px 16px',
                color: '#101828',
                fontSize: '13px',
                minWidth: '260px',
                outline: 'none',
              }}
            />

            {jobTypes.length > 1 && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDE1EC',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#101828',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                <option value="all">All Employment Types</option>
                {jobTypes.map((t: any) => (
                  <option key={t} value={t}>{t.replace('-', ' ')}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #DDE1EC',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#667085',
          }}>
            <p style={{ fontSize: '36px', marginBottom: '8px' }}>📝</p>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A223D', marginBottom: '4px' }}>
              No Openings Found
            </h3>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Try searching with different keywords or check back soon for new opportunities.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredJobs.map((j: any) => (
              <div
                key={j.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDE1EC',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = brandColor;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#DDE1EC';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A223D', margin: 0 }}>
                      {j.title}
                    </h3>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: 'rgba(20, 115, 230, 0.1)',
                      color: '#1473E6',
                      textTransform: 'capitalize',
                    }}>
                      {j.type.replace('-', ' ')}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#667085', marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {j.location && <span>📍 {j.location}</span>}
                    {j.salary && <span>💰 {j.salary}</span>}
                    <span>🗓 Posted {new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#344054', maxWidth: '640px', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5' }}>
                    {j.description}
                  </p>
                </div>

                <Link href={`/apply/${j.id}`}>
                  <button
                    style={{
                      padding: '10px 20px',
                      background: brandColor,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Apply Now →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid #DDE1EC',
        padding: '32px 24px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#667085',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {social.linkedin && (
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#1473E6', textDecoration: 'none', fontWeight: '600' }}>
              LinkedIn
            </a>
          )}
          {social.twitter && (
            <a href={social.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1473E6', textDecoration: 'none', fontWeight: '600' }}>
              Twitter / X
            </a>
          )}
          {social.github && (
            <a href={social.github} target="_blank" rel="noopener noreferrer" style={{ color: '#1473E6', textDecoration: 'none', fontWeight: '600' }}>
              GitHub
            </a>
          )}
          {company.website && (
            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1473E6', textDecoration: 'none', fontWeight: '600' }}>
              {company.name} Official Website
            </a>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '12px' }}>
          © {new Date().getFullYear()} {company.name}. Powered by RMS Recruitment Suite.
        </p>
      </footer>
    </div>
  );
}
