'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useMobility, DepartureEvent, EmployeeItem, SuccessorMatch } from '@/lib/hooks/usemobility';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

export default function PayrollMobilityPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const {
    events,
    employees,
    loading,
    error,
    fetchEvents,
    promoteEmployee,
    createJobFromVacancy,
    dismissEvent,
    fetchEmployees,
    createEmployee,
    seedEmployees,
    simulateDeparture,
  } = useMobility();

  const [activeTab, setActiveTab] = useState<'action_center' | 'talent_pool' | 'webhook_simulator'>('action_center');
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Promote Modal state
  const [promoteModalData, setPromoteModalData] = useState<{ event: DepartureEvent; match: SuccessorMatch } | null>(null);
  const [newSalaryInput, setNewSalaryInput] = useState<string>('');
  const [promoting, setPromoting] = useState<boolean>(false);

  // Job Requisition Modal state
  const [jobModalEvent, setJobModalEvent] = useState<DepartureEvent | null>(null);
  const [jobFormData, setJobFormData] = useState({ title: '', department: '', salary: '', location: 'Hybrid / Remote', type: 'full-time' });
  const [creatingJob, setCreatingJob] = useState<boolean>(false);

  // Simulator Modal state
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [simForm, setSimForm] = useState({
    employeeName: 'Sarah Connor',
    email: 'sarah.connor@company.com',
    department: 'Engineering',
    designation: 'Senior Backend Engineer',
    level: 'senior',
    salary: '125000',
    departureReason: 'Relocation & Career Transition',
    source: 'zoho_payroll',
  });
  const [simulating, setSimulating] = useState<boolean>(false);

  // New Employee Modal state
  const [showEmpModal, setShowEmpModal] = useState<boolean>(false);
  const [empForm, setEmpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: '',
    level: 'mid',
    skills: 'React, Node.js, TypeScript',
    experienceYears: '2',
    salary: '85000',
    performanceRating: '4.5',
  });

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (isLoggedIn) {
      fetchEvents();
      fetchEmployees();
    }
  }, [isLoggedIn, fetchEvents, fetchEmployees]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMsg = (success: string, err?: string) => {
    if (success) {
      setActionSuccess(success);
      setTimeout(() => setActionSuccess(''), 4000);
    }
    if (err) {
      setActionError(err);
      setTimeout(() => setActionError(''), 4000);
    }
  };

  /* ─── Handlers ─── */
  const handlePromoteConfirm = async () => {
    if (!promoteModalData) return;
    try {
      setPromoting(true);
      const salaryNum = newSalaryInput ? parseInt(newSalaryInput) : undefined;
      const res = await promoteEmployee(promoteModalData.event.id, promoteModalData.match.employeeId, salaryNum);
      setPromoteModalData(null);
      showMsg(`🎉 Successfully promoted ${promoteModalData.match.name} to ${promoteModalData.event.designation}! Automated backfill requisition created for their vacated role.`);
      fetchEmployees();
    } catch (err: any) {
      showMsg('', err.message || 'Promotion failed');
    } finally {
      setPromoting(false);
    }
  };

  const handleCreateJobConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobModalEvent) return;
    try {
      setCreatingJob(true);
      await createJobFromVacancy(jobModalEvent.id, jobFormData);
      setJobModalEvent(null);
      showMsg(`💼 Job opening created for "${jobFormData.title}". You can now syndicate it on job boards!`);
    } catch (err: any) {
      showMsg('', err.message || 'Failed to create job');
    } finally {
      setCreatingJob(false);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimulating(true);
      await simulateDeparture({
        ...simForm,
        salary: simForm.salary ? parseInt(simForm.salary) : undefined,
      });
      setShowSimModal(false);
      setActiveTab('action_center');
      showMsg(`⚡ Offboarding event ingested! AI has evaluated internal successors for ${simForm.designation}.`);
    } catch (err: any) {
      showMsg('', err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee({
        ...empForm,
        skills: empForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: parseInt(empForm.experienceYears) || 1,
        salary: parseInt(empForm.salary) || 75000,
        performanceRating: parseFloat(empForm.performanceRating) || 4.0,
      });
      setShowEmpModal(false);
      setEmpForm({ firstName: '', lastName: '', email: '', department: 'Engineering', designation: '', level: 'mid', skills: 'React, Node.js', experienceYears: '2', salary: '85000', performanceRating: '4.5' });
      showMsg('Employee added to internal talent directory');
    } catch (err: any) {
      showMsg('', err.message || 'Failed to add employee');
    }
  };

  const handleSeed = async () => {
    try {
      await seedEmployees();
      showMsg('🌱 Seeded sample workforce directory');
    } catch (err: any) {
      showMsg('', err.message);
    }
  };

  const pendingEvents = events.filter((e) => e.status === 'pending_action');
  const resolvedEvents = events.filter((e) => e.status !== 'pending_action');

  if (!isLoggedIn) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="zr-subheader-title">Payroll &amp; Internal Mobility</h1>
              <span className="zr-badge zr-badge-purple" style={{ fontSize: 10 }}>AI Talent Matcher</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Automated offboarding detection, internal succession promotions, and cascading vacancy hiring
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowSimModal(true)}
              className="zr-btn zr-btn-orange zr-btn-sm"
            >
              ⚡ Simulate Departure
            </button>
            <button
              onClick={() => setShowEmpModal(true)}
              className="zr-btn zr-btn-outline zr-btn-sm"
            >
              + Add Employee
            </button>
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: 1100 }}>
          {actionSuccess && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✓</span> {actionSuccess}
            </div>
          )}

          {actionError && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {actionError}
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--zr-border-light)', paddingBottom: 8 }}>
            {[
              { id: 'action_center', label: `🎯 Vacancy & Promotion Hub (${pendingEvents.length})` },
              { id: 'talent_pool', label: `👥 Internal Talent Directory (${employees.length})` },
              { id: 'webhook_simulator', label: '🔗 Payroll Webhook Setup' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#fff' : 'var(--zr-text-2)',
                  background: activeTab === tab.id ? 'var(--zr-blue)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ════════ TAB 1: ACTION CENTER ════════ */}
          {activeTab === 'action_center' && (
            <div>
              {pendingEvents.length === 0 ? (
                <div className="zr-card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', margin: '0 0 6px' }}>
                    No Open Vacancies Pending Review
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--zr-muted)', maxWidth: 460, margin: '0 auto 20px' }}>
                    When an employee offboards via Payroll (or simulation), the RMS AI will instantly match internal candidates for promotion or help you post a job opening.
                  </p>
                  <button
                    onClick={() => setShowSimModal(true)}
                    className="zr-btn zr-btn-orange zr-btn-sm"
                  >
                    ⚡ Test a Departure Simulation
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {pendingEvents.map((evt) => {
                    let matches: SuccessorMatch[] = [];
                    try {
                      matches = evt.suggestedSuccessors ? JSON.parse(evt.suggestedSuccessors) : [];
                    } catch {}

                    return (
                      <div
                        key={evt.id}
                        className="zr-card"
                        style={{
                          padding: 24,
                          border: evt.isCascadingVacancy ? '2px solid #8B5CF6' : '1px solid var(--zr-border)',
                          boxShadow: 'var(--zr-shadow-md)',
                        }}
                      >
                        {/* Event Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 16 }}>{evt.isCascadingVacancy ? '🚨' : '🚪'}</span>
                              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                                Vacancy: {evt.designation} ({evt.department})
                              </h3>
                              {evt.isCascadingVacancy && (
                                <span className="zr-badge zr-badge-purple" style={{ fontSize: 11 }}>
                                  Cascading Backfill Requisition
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: 0 }}>
                              {evt.isCascadingVacancy ? (
                                <>Seat vacated following internal promotion to <strong>{evt.cascadedFromRole}</strong></>
                              ) : (
                                <>Employee <strong>{evt.employeeName}</strong> departed on {new Date(evt.departureDate).toLocaleDateString()} · Reason: {evt.departureReason || 'Offboarding'}</>
                              )}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                setJobModalEvent(evt);
                                setJobFormData({
                                  title: evt.designation,
                                  department: evt.department,
                                  salary: evt.salary ? `$${evt.salary.toLocaleString()} / year` : '$90,000 - $120,000 / year',
                                  location: 'Hybrid / Remote',
                                  type: 'full-time',
                                });
                              }}
                              className="zr-btn zr-btn-orange zr-btn-sm"
                            >
                              💼 Create Job Requisition
                            </button>
                            <button
                              onClick={() => dismissEvent(evt.id)}
                              className="zr-btn zr-btn-ghost zr-btn-sm"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>

                        {/* AI Match Heading */}
                        <div style={{ background: 'var(--zr-blue-light)', border: '1px solid rgba(20,115,230,0.15)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--zr-blue)' }}>
                            <span>🤖</span> Zia AI Talent Mobility Recommendations
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--zr-text-2)', margin: '4px 0 0', lineHeight: 1.4 }}>
                            We evaluated your current workforce. The following internal team members have the skills and performance ratings to be promoted to this seat:
                          </p>
                        </div>

                        {/* Match Candidates Grid */}
                        {matches.length === 0 ? (
                          <div style={{ padding: 18, background: 'var(--zr-bg)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--zr-muted)' }}>
                            No internal employees found with direct skill overlap. Consider creating an external job opening.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                            {matches.map((m) => {
                              const matchColor = m.matchScore >= 80 ? '#27AE60' : m.matchScore >= 60 ? '#1473E6' : '#E8652A';
                              return (
                                <div
                                  key={m.employeeId}
                                  style={{
                                    background: 'var(--zr-white)',
                                    border: '1px solid var(--zr-border)',
                                    borderRadius: 8,
                                    padding: 16,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: 'var(--zr-shadow-sm)',
                                  }}
                                >
                                  <div>
                                    {/* Top row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                      <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)' }}>{m.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--zr-muted)' }}>{m.currentDesignation} ({m.department})</div>
                                      </div>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 800,
                                          color: matchColor,
                                          background: matchColor + '15',
                                          padding: '3px 8px',
                                          borderRadius: 20,
                                        }}
                                      >
                                        {m.matchScore}% Match
                                      </span>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--zr-text-2)', marginBottom: 10 }}>
                                      <span>⭐ {m.performanceRating.toFixed(1)} / 5.0 Appraisal</span>
                                      <span>⏱ {m.experienceYears}y Tenure</span>
                                    </div>

                                    {/* Readiness Pill */}
                                    <div style={{ marginBottom: 10 }}>
                                      <span
                                        className={m.readinessLevel === 'Ready Now' ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-blue'}
                                        style={{ fontSize: 10 }}
                                      >
                                        {m.readinessLevel}
                                      </span>
                                    </div>

                                    {/* Skills */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                      {m.skillsMatch.map((sk, i) => (
                                        <span key={i} style={{ fontSize: 10, background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', padding: '2px 6px', borderRadius: 4, color: 'var(--zr-text)' }}>
                                          ✓ {sk}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Reason */}
                                    <p style={{ fontSize: 11, color: 'var(--zr-muted)', margin: '0 0 14px', lineHeight: 1.35 }}>
                                      {m.recommendationReason}
                                    </p>
                                  </div>

                                  {/* Action Button */}
                                  <button
                                    onClick={() => {
                                      setPromoteModalData({ event: evt, match: m });
                                      setNewSalaryInput(evt.salary ? String(evt.salary) : '105000');
                                    }}
                                    className="zr-btn zr-btn-blue zr-btn-xs"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                  >
                                    🚀 Promote {m.name.split(' ')[0]} to This Role
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resolved / History */}
              {resolvedEvents.length > 0 && (
                <div className="zr-card" style={{ marginTop: 24, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--zr-border-light)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                      Resolved Vacancy &amp; Promotion History
                    </h3>
                  </div>
                  <table className="zr-table">
                    <thead>
                      <tr>
                        <th>Role &amp; Department</th>
                        <th>Vacated By</th>
                        <th>Resolution Outcome</th>
                        <th>Date Resolved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolvedEvents.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong>{r.designation}</strong>
                            <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{r.department}</div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--zr-text-2)' }}>{r.employeeName}</td>
                          <td>
                            {r.status === 'promoted_internally' ? (
                              <span className="zr-badge zr-badge-green">
                                🚀 Promoted {r.promotedEmployeeName || 'Internal Candidate'}
                              </span>
                            ) : r.status === 'requisition_created' ? (
                              <span className="zr-badge zr-badge-orange">
                                💼 Requisition #{r.createdJobId?.slice(0, 6) || 'JOB'} Opened
                              </span>
                            ) : (
                              <span className="zr-badge zr-badge-gray">Dismissed</span>
                            )}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--zr-muted)' }}>
                            {new Date(r.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════════ TAB 2: TALENT POOL ════════ */}
          {activeTab === 'talent_pool' && (
            <div className="zr-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--zr-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    Internal Workforce &amp; Succession Directory ({employees.length})
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    Active company employees tracked for internal promotion &amp; skill matching
                  </p>
                </div>
                {employees.length === 0 && (
                  <button onClick={handleSeed} className="zr-btn zr-btn-blue zr-btn-xs">
                    🌱 Populate Sample Employees
                  </button>
                )}
              </div>

              {employees.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--zr-muted)' }}>No employee records in directory.</p>
                  <button onClick={handleSeed} className="zr-btn zr-btn-orange zr-btn-sm">
                    🌱 Populate Sample Team Directory
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="zr-table">
                    <thead>
                      <tr>
                        <th>Code / Name</th>
                        <th>Department &amp; Title</th>
                        <th>Level</th>
                        <th>Skills &amp; Competencies</th>
                        <th>Tenure</th>
                        <th>Appraisal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => {
                        let skillsList: string[] = [];
                        try {
                          skillsList = emp.skills ? JSON.parse(emp.skills) : [];
                        } catch {}

                        return (
                          <tr key={emp.id}>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-text)' }}>
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{emp.employeeCode} · {emp.email}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-blue)' }}>{emp.designation}</div>
                              <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>{emp.department}</div>
                            </td>
                            <td>
                              <span className="zr-badge zr-badge-gray" style={{ textTransform: 'capitalize' }}>
                                {emp.level}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, maxWidth: 220 }}>
                                {skillsList.slice(0, 3).map((sk, i) => (
                                  <span key={i} style={{ fontSize: 10, background: 'var(--zr-blue-light)', color: 'var(--zr-blue)', padding: '1px 6px', borderRadius: 4 }}>
                                    {sk}
                                  </span>
                                ))}
                                {skillsList.length > 3 && <span style={{ fontSize: 10, color: 'var(--zr-muted)' }}>+{skillsList.length - 3}</span>}
                              </div>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--zr-text-2)' }}>{emp.experienceYears} yrs</td>
                            <td>
                              <span style={{ fontSize: 12, fontWeight: 700, color: emp.performanceRating >= 4.5 ? 'var(--zr-success)' : 'var(--zr-orange)' }}>
                                ⭐ {emp.performanceRating.toFixed(1)}
                              </span>
                            </td>
                            <td>
                              <span className={emp.status === 'active' ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-red'}>
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ════════ TAB 3: WEBHOOK & SIMULATOR ════════ */}
          {activeTab === 'webhook_simulator' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Webhook Info Card */}
              <div className="zr-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 8 }}>
                  📡 Automated Payroll Webhook Ingestion
                </h3>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  Configure your payroll provider (Zoho Payroll, Gusto, Deel, ADP, Workday, or custom HRIS) to send a webhook POST request whenever an employee is terminated or offboarded.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label className="zr-label">Your Inbound Payroll Webhook URL</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/public/payroll/webhook/demo-tech`}
                      className="zr-input"
                      style={{ fontSize: 12, background: 'var(--zr-bg)' }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/public/payroll/webhook/demo-tech`);
                        showMsg('Webhook URL copied to clipboard');
                      }}
                      className="zr-btn zr-btn-outline zr-btn-xs"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 6 }}>Sample JSON Webhook Payload:</div>
                  <pre style={{ fontSize: 11, color: 'var(--zr-text-2)', margin: 0, overflowX: 'auto', fontFamily: 'monospace' }}>
{`{
  "employeeCode": "EMP-101",
  "employeeName": "Alex Mercer",
  "department": "Engineering",
  "designation": "Lead Backend Architect",
  "salary": 135000,
  "departureReason": "Relocation",
  "departureDate": "2026-08-16"
}`}
                  </pre>
                </div>
              </div>

              {/* Instant Simulator */}
              <div className="zr-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--zr-text)', marginBottom: 8 }}>
                  ⚡ Live Offboarding Simulator
                </h3>
                <p style={{ fontSize: 12, color: 'var(--zr-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  Test how the RMS AI detects the departure, scores your internal talent pool, and prompts HR with succession recommendations.
                </p>

                <form onSubmit={handleSimulateSubmit}>
                  <div style={{ marginBottom: 12 }}>
                    <label className="zr-label">Departing Employee Name</label>
                    <input
                      type="text"
                      value={simForm.employeeName}
                      onChange={(e) => setSimForm({ ...simForm, employeeName: e.target.value })}
                      className="zr-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label className="zr-label">Department</label>
                      <select
                        value={simForm.department}
                        onChange={(e) => setSimForm({ ...simForm, department: e.target.value })}
                        className="zr-input"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>

                    <div>
                      <label className="zr-label">Vacated Designation</label>
                      <input
                        type="text"
                        value={simForm.designation}
                        onChange={(e) => setSimForm({ ...simForm, designation: e.target.value })}
                        className="zr-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="zr-label">Departure Reason</label>
                    <input
                      type="text"
                      value={simForm.departureReason}
                      onChange={(e) => setSimForm({ ...simForm, departureReason: e.target.value })}
                      className="zr-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={simulating}
                    className="zr-btn zr-btn-orange zr-btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {simulating ? 'Evaluating AI Matches...' : '🚀 Trigger Departure & Run AI Succession'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ══ MODAL 1: PROMOTE CONFIRMATION ══ */}
        {promoteModalData && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="zr-card" style={{ width: '100%', maxWidth: 480, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: '0 0 10px' }}>
                🚀 Confirm Internal Promotion
              </h3>
              <p style={{ fontSize: 13, color: 'var(--zr-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                You are promoting <strong>{promoteModalData.match.name}</strong> from <em>{promoteModalData.match.currentDesignation}</em> to <strong>{promoteModalData.event.designation}</strong> in {promoteModalData.event.department}.
              </p>

              <div style={{ background: 'var(--zr-purple-light)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--zr-purple)', fontWeight: 600 }}>
                🚨 Automated Cascading Action: Once promoted, {promoteModalData.match.name.split(' ')[0]}'s former seat ({promoteModalData.match.currentDesignation}) will immediately be flagged for backfilling!
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="zr-label">New Annual Compensation (USD)</label>
                <input
                  type="number"
                  value={newSalaryInput}
                  onChange={(e) => setNewSalaryInput(e.target.value)}
                  className="zr-input"
                  placeholder="e.g. 115000"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setPromoteModalData(null)} className="zr-btn zr-btn-ghost zr-btn-sm">
                  Cancel
                </button>
                <button
                  onClick={handlePromoteConfirm}
                  disabled={promoting}
                  className="zr-btn zr-btn-blue zr-btn-sm"
                >
                  {promoting ? 'Promoting...' : 'Confirm Promotion & Trigger Backfill'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ MODAL 2: JOB REQUISITION CREATION ══ */}
        {jobModalEvent && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="zr-card" style={{ width: '100%', maxWidth: 500, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: '0 0 10px' }}>
                💼 Create External Job Opening
              </h3>
              <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginBottom: 16 }}>
                Pre-populate a job requisition to hire an external candidate for this vacant seat.
              </p>

              <form onSubmit={handleCreateJobConfirm}>
                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="zr-label">Department</label>
                    <input
                      type="text"
                      value={jobFormData.department}
                      onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                      className="zr-input"
                    />
                  </div>

                  <div>
                    <label className="zr-label">Salary Range</label>
                    <input
                      type="text"
                      value={jobFormData.salary}
                      onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                  <button type="button" onClick={() => setJobModalEvent(null)} className="zr-btn zr-btn-ghost zr-btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={creatingJob} className="zr-btn zr-btn-orange zr-btn-sm">
                    {creatingJob ? 'Publishing...' : 'Create Draft Job Opening'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ MODAL 3: SIMULATOR MODAL ══ */}
        {showSimModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="zr-card" style={{ width: '100%', maxWidth: 480, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  ⚡ Simulate Payroll Offboarding
                </h3>
                <button onClick={() => setShowSimModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}>✕</button>
              </div>

              <form onSubmit={handleSimulateSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Departing Employee</label>
                  <input
                    type="text"
                    required
                    value={simForm.employeeName}
                    onChange={(e) => setSimForm({ ...simForm, employeeName: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="zr-label">Department</label>
                    <select
                      value={simForm.department}
                      onChange={(e) => setSimForm({ ...simForm, department: e.target.value })}
                      className="zr-input"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="zr-label">Role</label>
                    <input
                      type="text"
                      required
                      value={simForm.designation}
                      onChange={(e) => setSimForm({ ...simForm, designation: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="zr-label">Departure Reason</label>
                  <input
                    type="text"
                    value={simForm.departureReason}
                    onChange={(e) => setSimForm({ ...simForm, departureReason: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowSimModal(false)} className="zr-btn zr-btn-ghost zr-btn-sm">Cancel</button>
                  <button type="submit" disabled={simulating} className="zr-btn zr-btn-orange zr-btn-sm">
                    {simulating ? 'Evaluating...' : 'Simulate Departure'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ MODAL 4: ADD EMPLOYEE MODAL ══ */}
        {showEmpModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="zr-card" style={{ width: '100%', maxWidth: 500, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>Add Employee to Directory</h3>
                <button onClick={() => setShowEmpModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}>✕</button>
              </div>

              <form onSubmit={handleCreateEmpSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="zr-label">First Name *</label>
                    <input
                      type="text"
                      required
                      value={empForm.firstName}
                      onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                  <div>
                    <label className="zr-label">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={empForm.lastName}
                      onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label className="zr-label">Department</label>
                    <select
                      value={empForm.department}
                      onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                      className="zr-input"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="zr-label">Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mid Frontend Dev"
                      value={empForm.designation}
                      onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="zr-label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={empForm.skills}
                    onChange={(e) => setEmpForm({ ...empForm, skills: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  <div>
                    <label className="zr-label">Experience (Years)</label>
                    <input
                      type="number"
                      value={empForm.experienceYears}
                      onChange={(e) => setEmpForm({ ...empForm, experienceYears: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                  <div>
                    <label className="zr-label">Performance Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={empForm.performanceRating}
                      onChange={(e) => setEmpForm({ ...empForm, performanceRating: e.target.value })}
                      className="zr-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowEmpModal(false)} className="zr-btn zr-btn-ghost zr-btn-sm">Cancel</button>
                  <button type="submit" className="zr-btn zr-btn-orange zr-btn-sm">Save Employee</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
