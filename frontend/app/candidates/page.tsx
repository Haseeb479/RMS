'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCandidates } from '@/lib/hooks/usecandidates';
import { useResume } from '@/lib/hooks/useresume';
import Sidebar from '@/components/sidebar';
import { useEffect, useState } from 'react';

export default function AddCandidatePage() {
  const { isLoggedIn } = useAuth();
  const { createCandidate } = useCandidates();
  const { uploadResume, uploading, error: uploadError, parsedData } = useResume();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    salary: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  // Auto-fill form with parsed resume data
  useEffect(() => {
    if (parsedData) {
      setFormData(prev => ({
        ...prev,
        firstName: parsedData.firstName || prev.firstName,
        lastName: parsedData.lastName || prev.lastName,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        experience: parsedData.experience ? String(parsedData.experience) : prev.experience,
      }));
    }
  }, [parsedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    try {
      await uploadResume(file);
    } catch (err) {
      setError('Failed to parse resume');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createCandidate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        salary: formData.salary ? parseInt(formData.salary) : null,
        notes: formData.notes || null,
      });
      router.push('/candidates');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create candidate');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) return <div style={{ background: '#090d16', minHeight: '100vh', color: '#94a3b8', padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090d16', color: '#f8fafc' }}>
      <Sidebar />

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
            Add Candidate
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxWidth: '640px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#f8fafc',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}>
              New Candidate
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Add a candidate to your talent pool
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}>
            <form onSubmit={handleSubmit}>
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

              {uploadError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#f87171',
                }}>
                  ⚠️ Resume Error: {uploadError}
                </div>
              )}

              {/* RESUME UPLOAD SECTION */}
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#f8fafc',
                }}>
                  Upload Resume (Optional)
                </label>
                <p style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '14px',
                }}>
                  PDF, DOCX, DOC, or TXT (Max 5MB) — We'll auto-fill candidate details
                </p>
                <div style={{
                  border: '2px dashed rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  background: resumeFile ? 'rgba(16, 185, 129, 0.1)' : '#1e293b',
                  transition: 'all 0.2s ease',
                }}>
                  <input
                    type="file"
                    id="resume-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt"
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="resume-upload"
                    style={{
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.6 : 1,
                      display: 'block',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#f8fafc' }}>
                      {uploading ? 'Parsing & Uploading...' : '📄 Click to upload or drag & drop resume'}
                    </p>
                    {resumeFile && (
                      <p style={{ fontSize: '13px', color: '#34d399', marginTop: '8px', fontWeight: '500' }}>
                        ✅ {resumeFile.name}
                      </p>
                    )}
                    {parsedData && (
                      <p style={{ fontSize: '12px', color: '#34d399', marginTop: '6px' }}>
                        ✓ Resume parsed — fields auto-filled below
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {/* First Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
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

              {/* Last Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
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

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
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

              {/* Phone */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
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

              {/* Location */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="New York, NY"
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

              {/* Experience */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Experience (Years, Optional)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="5"
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

              {/* Salary */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Expected Salary ($, Optional)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="80000"
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

              {/* Notes */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '6px',
                  color: '#cbd5e1',
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional candidate notes..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: '#1e293b',
                    color: '#f8fafc',
                    minHeight: '100px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Submit */}
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
                {saving ? 'Creating Candidate...' : 'Add Candidate'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}