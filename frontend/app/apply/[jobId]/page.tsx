'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePublic, PublicJob } from '@/lib/hooks/usepublic';
import Link from 'next/link';

export default function PublicCandidateApplyPage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  const { getPublicJob, submitApplication, loading } = usePublic();

  const [job, setJob] = useState<PublicJob | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [notes, setNotes] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Submit Feedback
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (jobId) {
      setFetching(true);
      getPublicJob(jobId)
        .then((res) => {
          setJob(res);
        })
        .catch((err) => {
          setFetchError(err.message || 'Job opening not found or no longer active.');
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSubmitError('First Name, Last Name, and Email are required.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('email', email.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (location.trim()) formData.append('location', location.trim());
      if (experience.trim()) formData.append('experience', experience.trim());
      if (skills.trim()) formData.append('skills', skills.trim());
      if (notes.trim()) formData.append('notes', notes.trim());
      if (resumeFile) formData.append('resume', resumeFile);

      await submitApplication(formData);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <p style={{ fontSize: '15px' }}>Loading job portal details...</p>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div style={{ background: '#090d16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#f8fafc', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Job Position Not Found</h2>
        <p style={{ color: '#94a3b8', maxWidth: '440px', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          {fetchError || 'This job opening may have been closed or the application link is invalid.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header Navigation */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '16px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '15px',
          }}>
            {job.company.name?.[0] || 'C'}
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
              {job.company.name} Careers
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Official Candidate Portal</p>
          </div>
        </div>

        {job.company.slug && (
          <Link href={`/careers/${job.company.slug}`}>
            <span style={{ fontSize: '13px', color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}>
              View All Openings at {job.company.name} →
            </span>
          </Link>
        )}
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {submitted ? (
          /* Application Success Card */
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '20px',
            padding: '48px 36px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '40px auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              margin: '0 auto 24px',
            }}>
              ✅
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc', marginBottom: '12px' }}>
              Application Received!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '28px' }}>
              Thank you for applying for the <strong style={{ color: '#818cf8' }}>{job.title}</strong> position at <strong style={{ color: '#e2e8f0' }}>{job.company.name}</strong>.
              Our recruitment team has received your application and CV details.
            </p>

            <div style={{
              background: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '32px',
            }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '10px' }}>
                Application Summary
              </p>
              <p style={{ fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                <strong>Applicant:</strong> {firstName} {lastName} ({email})
              </p>
              <p style={{ fontSize: '14px', color: '#f8fafc', marginBottom: '4px' }}>
                <strong>Position:</strong> {job.title} ({job.location || 'Remote'})
              </p>
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>
                <strong>Resume Uploaded:</strong> {resumeFile ? resumeFile.name : 'Recorded'}
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
                setLocation('');
                setExperience('');
                setSkills('');
                setNotes('');
                setResumeFile(null);
              }}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          /* Application Form Layout (2 Columns) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
            {/* Left: Job Specifications & Info */}
            <div>
              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                position: 'sticky',
                top: '90px',
              }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  display: 'inline-block',
                  marginBottom: '16px',
                }}>
                  {job.type}
                </span>

                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                  {job.title}
                </h1>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>
                  {job.location && <span>📍 {job.location}</span>}
                  {job.salary && <span>💰 {job.salary}</span>}
                  <span>🏢 {job.company.name}</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Job Description
                  </h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {job.description}
                  </p>
                </div>

                {job.requirements && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Requirements & Skills
                    </h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {job.requirements}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Application Submission Form */}
            <div>
              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                  Apply for this Position
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                  Submit your contact details and CV to get considered.
                </p>

                {submitError && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#f8fafc',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Current Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="New York, NY"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="5"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Top Skills
                      </label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="React, TypeScript, Node.js"
                        style={{
                          width: '100%',
                          background: '#1e293b',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f8fafc',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Resume Upload Drag & Drop */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Upload Resume / CV (PDF, DOCX)
                    </label>
                    <div style={{
                      border: '2px dashed rgba(99, 102, 241, 0.35)',
                      background: 'rgba(99, 102, 241, 0.05)',
                      borderRadius: '12px',
                      padding: '24px',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                      {resumeFile ? (
                        <div>
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#34d399', margin: '4px 0' }}>
                            {resumeFile.name}
                          </p>
                          <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: '24px' }}>📤</span>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', margin: '4px 0' }}>
                            Drop your resume here, or <span style={{ color: '#818cf8' }}>browse</span>
                          </p>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>
                            Supports PDF, DOCX, DOC up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Cover Note / Additional Pitch
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Brief note about why you are a great fit for this role..."
                      style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#f8fafc',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: '8px',
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Submitting Application...' : '🚀 Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
