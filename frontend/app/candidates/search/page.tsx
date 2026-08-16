'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';
import { api } from '@/lib/api';
import Link from 'next/link';

const EXAMPLE_QUERIES = [
  'React AND Node.js',
  'Python AND Machine Learning NOT Junior',
  'AWS AND Docker AND Kubernetes',
  'Java AND Spring NOT PHP',
  'React AND TypeScript AND GraphQL',
];

function highlightTerms(text: string, terms: string[]): string {
  if (!text || !terms.length) return text;
  let result = text;
  terms.forEach(term => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '<mark style="background:var(--zr-orange-light);color:var(--zr-orange);padding:1px 4px;border-radius:3px;font-weight:700;">$1</mark>');
  });
  return result;
}

export default function BooleanSearchPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const handleSearch = async (q?: string) => {
    const searchQ = q ?? query;
    if (!searchQ.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const res = await api.get(`/resumes/search?q=${encodeURIComponent(searchQ.trim())}`);
      const data = res.data.data;
      setResults(data.results ?? []);
      setMeta(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSearching(false);
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
            <h1 className="zr-subheader-title">Boolean Resume Search</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Full-text indexed resume search supporting boolean AND, OR, NOT operators
            </p>
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: '1100px' }}>
          {/* Search Box Card */}
          <div className="zr-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--zr-text)', marginBottom: '4px' }}>
              Search Across All Candidate CVs
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--zr-muted)', marginBottom: '16px' }}>
              Operators supported: <code style={{ background: 'var(--zr-bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--zr-blue)', fontWeight: 600 }}>AND</code>, <code style={{ background: 'var(--zr-bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--zr-blue)', fontWeight: 600 }}>OR</code>, <code style={{ background: 'var(--zr-bg)', padding: '2px 6px', borderRadius: '4px', color: 'var(--zr-danger)', fontWeight: 600 }}>NOT</code>
            </p>

            {/* Input & Search Button */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. React AND Node.js NOT PHP"
                className="zr-input"
                style={{ fontSize: '14px', fontFamily: 'monospace' }}
              />
              <button
                onClick={() => handleSearch()}
                disabled={searching || !query.trim()}
                className="zr-btn zr-btn-primary"
                style={{ opacity: (!query.trim() || searching) ? 0.5 : 1, whiteSpace: 'nowrap' }}
              >
                {searching ? 'Searching...' : '🔍 Run Search'}
              </button>
            </div>

            {/* Quick Example Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--zr-muted)', fontWeight: 600 }}>Suggested:</span>
              {EXAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(q); }}
                  style={{
                    background: 'var(--zr-bg)',
                    border: '1px solid var(--zr-border)',
                    borderRadius: '16px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    color: 'var(--zr-text-2)',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.borderColor = 'var(--zr-blue)';
                    (e.target as HTMLElement).style.color = 'var(--zr-blue)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.borderColor = 'var(--zr-border)';
                    (e.target as HTMLElement).style.color = 'var(--zr-text-2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Search Meta Banner */}
          {hasSearched && meta && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '13px', color: 'var(--zr-muted)' }}>
              <span>
                Found <strong style={{ color: 'var(--zr-text)' }}>{meta.totalMatches}</strong> matching candidates across <strong style={{ color: 'var(--zr-text)' }}>{meta.totalCandidates}</strong> scanned profiles
              </span>
              {meta.terms?.length > 0 && (
                <span>
                  Query terms: {meta.terms.map((t: string) => <code key={t} style={{ background: 'var(--zr-orange-light)', color: 'var(--zr-orange)', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px', fontWeight: 600 }}>{t}</code>)}
                </span>
              )}
            </div>
          )}

          {/* Results List */}
          {searching ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--zr-muted)', fontSize: '13px' }}>
              Executing full-text search against CV documents...
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="zr-empty">
              <div className="zr-empty-icon">🔍</div>
              <div className="zr-empty-title">No candidate matches found</div>
              <div className="zr-empty-desc">
                No parsed resumes satisfied your boolean criteria. Try broadening your terms or using OR logic.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {results.map((r: any) => {
                const c = r.candidate;
                const resume = r.resume;
                const terms = meta?.terms ?? [];
                const snippetHtml = highlightTerms(r.snippet, terms);

                return (
                  <div key={r.id} className="zr-card" style={{ padding: '20px', transition: 'box-shadow 0.15s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <Link href={`/candidates/${c.id}`}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--zr-blue)', cursor: 'pointer' }}>
                            {c.firstName} {c.lastName}
                          </span>
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--zr-muted)', marginTop: '2px' }}>
                          {c.email} {c.phone ? `· ${c.phone}` : ''} {c.location ? `· 📍 ${c.location}` : ''}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="zr-badge zr-badge-green">
                          Score: {r.score}
                        </span>
                        <Link href={`/candidates/${c.id}`}>
                          <button className="zr-btn zr-btn-outline zr-btn-xs">
                            View Profile →
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Resume Source filename */}
                    {resume && (
                      <div style={{ fontSize: '11px', color: 'var(--zr-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📄 File:</span> <strong>{resume.fileName}</strong>
                      </div>
                    )}

                    {/* Snippet preview with highlighted terms */}
                    {r.snippet && (
                      <div
                        style={{
                          background: 'var(--zr-bg)',
                          border: '1px solid var(--zr-border)',
                          borderRadius: 'var(--zr-radius)',
                          padding: '12px 14px',
                          fontSize: '12px',
                          lineHeight: '1.6',
                          color: 'var(--zr-text-2)',
                        }}
                        dangerouslySetInnerHTML={{ __html: snippetHtml }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
