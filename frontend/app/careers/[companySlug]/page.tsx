'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePublic, PublicCompanyCareers } from '@/lib/hooks/usepublic';
import Link from 'next/link';

export default function PublicCompanyCareersPage() {
  const params = useParams();
  const companySlug = params?.companySlug as string;
  const { getCompanyCareers } = usePublic();

  const [company, setCompany] = useState<PublicCompanyCareers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (companySlug) {
      setLoading(true);
      getCompanyCareers(companySlug)
        .then((res) => {
          setCompany(res);
        })
        .catch((err) => {
          setError(err.message || 'Company careers portal not found.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [companySlug]);

  if (loading) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: '15px' }}>Loading careers portal...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#f8fafc', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Company Careers Not Found</h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          {error || 'This company career page is unavailable or no longer active.'}
        </p>
      </div>
    );
  }

  const filteredJobs = company.jobs.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.location && j.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Header */}
      <header style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '60px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '28px',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          }}>
            {company.name[0]}
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#f8fafc', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Careers at {company.name}
          </h1>

          <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            {company.description || `Join our team at ${company.name}. Explore open positions and build your career with us.`}
          </p>

          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '13px',
                color: '#818cf8',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              🌐 Visit {company.website} ↗
            </a>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
              Open Positions ({company.jobs.length})
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Find the right role for your skills
            </p>
          </div>

          <input
            type="text"
            placeholder="Search by job title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#f8fafc',
              fontSize: '14px',
              minWidth: '280px',
              outline: 'none',
            }}
          />
        </div>

        {/* Job Cards List */}
        {filteredJobs.length === 0 ? (
          <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>📝</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>No matching openings found</p>
            <p style={{ fontSize: '13px' }}>Try searching with a different job title or location</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredJobs.map((j) => (
              <div
                key={j.id}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
                      {j.title}
                    </h3>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#a5b4fc',
                    }}>
                      {j.type}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                    {j.location ? `📍 ${j.location} • ` : ''} Posted {new Date(j.createdAt).toLocaleDateString()} {j.salary ? `• 💰 ${j.salary}` : ''}
                  </p>

                  <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '600px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {j.description}
                  </p>
                </div>

                <Link href={`/apply/${j.id}`}>
                  <button style={{
                    padding: '11px 22px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    whiteSpace: 'nowrap',
                  }}>
                    Apply Now →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
