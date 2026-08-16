'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePublic, PublicJob } from '@/lib/hooks/usepublic';
import Link from 'next/link';

export default function PublicCandidateApplyPage() {
  const params = useParams();
  const jobId = params?.jobId as string;
  const { getPublicJob, submitApplication } = usePublic();

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [privacyConsent, setPrivacyConsent] = useState(true);

  // Submit Feedback
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    setFetching(true);
    getPublicJob(jobId)
      .then((res) => {
        if (isMounted) setJob(res);
      })
      .catch((err) => {
        if (isMounted) setFetchError(err.message || 'Job opening not found or no longer active.');
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [jobId, getPublicJob]);

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setSubmitError('First Name, Last Name, and Email are required.');
      return;
    }

    if (!privacyConsent) {
      setSubmitError('You must accept the Data Privacy Policy to submit your application.');
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
      formData.append('privacyConsent', 'true');
      formData.append('answers', JSON.stringify(answers));

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
      <div style={{ background: '#F0F2F7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667085', fontFamily: "'Inter', sans-serif" }}>
        <p style={{ fontSize: '15px' }}>Loading application details...</p>
      </div>
    );
  }

  if (fetchError || !job) {
    return (
      <div style={{ background: '#F0F2F7', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', color: '#101828', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#1A223D' }}>Job Position Not Found</h2>
        <p style={{ color: '#667085', maxWidth: '440px', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
          {fetchError || 'This job opening may have been closed or the application link is invalid.'}
        </p>
      </div>
    );
  }

  const brandColor = job.company?.careerColor || '#E8652A';
  const companyCareersUrl = job.company?.slug ? `/careers/${job.company.slug}` : '/';

  return (
    <div style={{ background: '#F0F2F7', minHeight: '100vh', color: '#101828', fontFamily: "'Inter', sans-serif" }}>

      {/* Top Header Navigation */}
      <header style={{
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: brandColor,
            color: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '16px',
          }}>
            {job.company.name?.[0] || 'C'}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1A223D' }}>
              {job.company.name}
            </div>
            <div style={{ fontSize: '11px', color: '#667085' }}>
              Careers Portal
            </div>
          </div>
        </div>

        <Link
          href={companyCareersUrl}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#1473E6',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← All Open Positions
        </Link>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '36px 20px 64px' }}>

        {submitted ? (
          /* Application Submission Success View */
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #DDE1EC',
            borderRadius: '12px',
            padding: '56px 24px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '40px auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(39, 174, 96, 0.12)',
              color: '#27AE60',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontWeight: '800',
              margin: '0 auto 20px',
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A223D', marginBottom: '8px' }}>
              Application Submitted Successfully!
            </h2>
            <p style={{ fontSize: '14px', color: '#667085', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Thank you for applying for <strong>{job.title}</strong> at {job.company.name}. Our recruitment team has received your application and will review your profile shortly.
            </p>
            <Link href={companyCareersUrl}>
              <button
                style={{
                  background: brandColor,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Return to Careers Portal
              </button>
            </Link>
          </div>
        ) : (
          /* 2-Column Job Apply Layout */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) minmax(460px, 1.4fr)', gap: '28px', alignItems: 'start' }}>

            {/* Left: Job Opening Overview Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{
                background: '#FFFFFF',
                border: '1px solid #DDE1EC',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: 'rgba(20, 115, 230, 0.1)',
                    color: '#1473E6',
                    textTransform: 'capitalize',
                  }}>
                    {job.type.replace('-', ' ')}
                  </span>
                  <span style={{ fontSize: '12px', color: '#667085' }}>
                    {job.location ? `📍 ${job.location}` : '🌐 Remote'}
                  </span>
                </div>

                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1A223D', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                  {job.title}
                </h1>

                {job.salary && (
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#27AE60', marginBottom: '16px' }}>
                    💰 {job.salary}
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#667085', borderTop: '1px solid #F0F2F7', paddingTop: '12px', marginBottom: '16px' }}>
                  Posted {new Date(job.createdAt).toLocaleDateString()} · Job ID: #{job.id.slice(-6)}
                </div>

                <div style={{ borderTop: '1px solid #F0F2F7', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A223D', marginBottom: '8px' }}>
                    Role Description
                  </h3>
                  <div style={{ fontSize: '13px', color: '#344054', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {job.description}
                  </div>
                </div>

                {job.requirements && (
                  <div style={{ borderTop: '1px solid #F0F2F7', paddingTop: '16px', marginTop: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A223D', marginBottom: '8px' }}>
                      Key Requirements
                    </h3>
                    <div style={{ fontSize: '13px', color: '#344054', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {job.requirements}
                    </div>
                  </div>
                )}
              </div>

              {/* Company Info Box */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #DDE1EC',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#1A223D', marginBottom: '6px' }}>
                  About {job.company.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#667085', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  {job.company.description || 'We are building cutting-edge software solutions.'}
                </p>
                {job.company.website && (
                  <a
                    href={job.company.website.startsWith('http') ? job.company.website : `https://${job.company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#1473E6', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Visit company website ↗
                  </a>
                )}
              </div>

            </div>

            {/* Right: Application Form Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #DDE1EC',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}>
              <div style={{ borderBottom: '1px solid #F0F2F7', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1A223D', margin: '0 0 4px 0' }}>
                  Apply for this position
                </h2>
                <p style={{ fontSize: '12px', color: '#667085', margin: 0 }}>
                  Please fill out your details and upload your resume
                </p>
              </div>

              {submitError && (
                <div style={{
                  background: 'var(--zr-danger-light)',
                  border: '1px solid var(--zr-danger)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--zr-danger)',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '18px',
                }}>
                  ⚠ {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Personal Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      Current City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      placeholder="e.g. 5"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#FFFFFF',
                        border: '1px solid #DDE1EC',
                        borderRadius: '6px',
                        padding: '9px 12px',
                        fontSize: '13px',
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                    Key Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, Python, PostgreSQL"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #DDE1EC',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      fontSize: '13px',
                      color: '#101828',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Resume Upload Dropzone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                    Resume / CV Document *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc"
                    style={{ display: 'none' }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #DDE1EC',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: '#FAFAFA',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = brandColor;
                      (e.currentTarget as HTMLDivElement).style.background = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#DDE1EC';
                      (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA';
                    }}
                  >
                    {resumeFile ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A223D' }}>{resumeFile.name}</div>
                          <div style={{ fontSize: '11px', color: '#667085' }}>{(resumeFile.size / 1024).toFixed(1)} KB · Click to replace</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📤</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1A223D' }}>
                          Click to upload resume (PDF, DOCX)
                        </div>
                        <div style={{ fontSize: '11px', color: '#667085', marginTop: '2px' }}>
                          Max file size 10MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Screening Questions */}
                {job.questions && job.questions.length > 0 && (
                  <div style={{ borderTop: '1px solid #F0F2F7', paddingTop: '16px', marginTop: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A223D', marginBottom: '12px' }}>
                      Screening Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {job.questions.map((q) => (
                        <div key={q.id}>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                            {q.question} {q.isRequired && <span style={{ color: 'var(--zr-danger)' }}>*</span>}
                          </label>

                          {q.type === 'text' && (
                            <input
                              type="text"
                              required={q.isRequired}
                              placeholder="Your answer..."
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid #DDE1EC',
                                borderRadius: '6px',
                                padding: '9px 12px',
                                fontSize: '13px',
                                color: '#101828',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          )}

                          {q.type === 'textarea' && (
                            <textarea
                              rows={3}
                              required={q.isRequired}
                              placeholder="Your answer..."
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid #DDE1EC',
                                borderRadius: '6px',
                                padding: '9px 12px',
                                fontSize: '13px',
                                color: '#101828',
                                outline: 'none',
                                boxSizing: 'border-box',
                                resize: 'vertical',
                              }}
                            />
                          )}

                          {q.type === 'select' && q.options && (
                            <select
                              required={q.isRequired}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              style={{
                                width: '100%',
                                background: '#FFFFFF',
                                border: '1px solid #DDE1EC',
                                borderRadius: '6px',
                                padding: '9px 12px',
                                fontSize: '13px',
                                color: '#101828',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            >
                              <option value="">Select option...</option>
                              {(Array.isArray(q.options) ? q.options : []).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#344054', marginBottom: '4px' }}>
                    Cover Note / Additional Comments (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you are interested in this position..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #DDE1EC',
                      borderRadius: '6px',
                      padding: '9px 12px',
                      fontSize: '13px',
                      color: '#101828',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Privacy Consent Checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyConsent}
                    onChange={(e) => setPrivacyConsent(e.target.checked)}
                    style={{ marginTop: '2px', cursor: 'pointer' }}
                  />
                  <label htmlFor="privacy" style={{ fontSize: '12px', color: '#667085', cursor: 'pointer', lineHeight: '1.4' }}>
                    I acknowledge that my candidate profile and CV data will be processed for recruitment purposes by {job.company.name} in compliance with applicable data privacy regulations.
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: brandColor,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '13px 20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginTop: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    opacity: submitting ? 0.65 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application →'}
                </button>

              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
