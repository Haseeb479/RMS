'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCandidates } from '@/lib/hooks/usecandidates';
import Sidebar from '@/components/sidebar';
import { useEffect, useState } from 'react';

export default function AddCandidatePage() {
  const { isLoggedIn } = useAuth();
  const { createCandidate } = useCandidates();
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

  if (!isLoggedIn) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafaf8' }}>
      <Sidebar />

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
            Add Candidate
          </h1>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', maxWidth: '600px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '8px',
            }}>
              New Candidate
            </h2>
            <p style={{ fontSize: '14px', color: '#999' }}>
              Add a candidate to your talent pool
            </p>
          </div>

          {/* Form */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e5e3',
            borderRadius: '8px',
            padding: '24px',
          }}>
            <form onSubmit={handleSubmit}>
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

              {/* First Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
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
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
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
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
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
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Location */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Experience */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Salary */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#1a1a1a',
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
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px',
                  color: '#1a1a1a',
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e5e3',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    minHeight: '100px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Submit */}
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
                }}
              >
                {saving ? 'Creating...' : 'Add Candidate'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}