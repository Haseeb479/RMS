'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useMobility, EmployeeItem } from '@/lib/hooks/usemobility';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

const DEPARTMENTS = [
  'All',
  'Supply Chain Management',
  'IT and Support',
  'ERP',
  'HR Department',
  'Import Export Depart',
  'Sales Deprt',
] as const;

const DEPT_ICONS: Record<string, string> = {
  'Supply Chain Management': '📦',
  'IT and Support': '💻',
  'ERP': '⚙️',
  'HR Department': '👥',
  'Import Export Depart': '🚢',
  'Sales Deprt': '📈',
};

const LEVEL_COLORS: Record<string, { bg: string; color: string }> = {
  vp: { bg: '#F5F0FF', color: '#8B5CF6' },
  director: { bg: '#EEF4FF', color: '#1473E6' },
  lead: { bg: '#FFF4EE', color: '#E8652A' },
  senior: { bg: '#EDFBF4', color: '#27AE60' },
  mid: { bg: '#F7FAFC', color: '#4A5568' },
  junior: { bg: '#F7FAFC', color: '#718096' },
};

export default function PayrollDemoPortal() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    employees,
    loading,
    fetchEmployees,
    simulateDeparture,
    seedEmployees,
  } = useMobility();

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [seeding, setSeeding] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Offboarding modal
  const [selectedEmpForExit, setSelectedEmpForExit] = useState<EmployeeItem | null>(null);
  const [exitReason, setExitReason] = useState<string>('Resignation / Accepted New Opportunity');
  const [exitDate, setExitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [lastDispatchedEvent, setLastDispatchedEvent] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn, fetchEmployees]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-seed on first load if empty
  useEffect(() => {
    if (employees.length === 0 && !loading && isLoggedIn) {
      seedEmployees(false);
    }
  }, [employees.length, loading, isLoggedIn, seedEmployees]);

  const handleSeedAll = async (force = true) => {
    try {
      setSeeding(true);
      const res = await seedEmployees(force);
      setActionSuccess(`🌱 ${res.message || 'Populated 120 enterprise employee records!'}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setActionError(err.message || 'Seeding failed');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setSeeding(false);
    }
  };

  const handleDispatchOffboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForExit) return;

    try {
      setDispatching(true);
      const payload = {
        employeeCode: selectedEmpForExit.employeeCode,
        employeeName: `${selectedEmpForExit.firstName} ${selectedEmpForExit.lastName}`,
        email: selectedEmpForExit.email,
        department: selectedEmpForExit.department,
        designation: selectedEmpForExit.designation,
        level: selectedEmpForExit.level,
        salary: selectedEmpForExit.salary,
        departureDate: exitDate,
        departureReason: exitReason,
        source: 'zoho_payroll_webhook',
      };

      const result = await simulateDeparture(payload);
      setLastDispatchedEvent({
        employee: selectedEmpForExit,
        event: result,
      });
      setSelectedEmpForExit(null);
      fetchEmployees();
    } catch (err: any) {
      setActionError(err.message || 'Failed to dispatch webhook');
      setTimeout(() => setActionError(''), 4000);
    } finally {
      setDispatching(false);
    }
  };

  const handleRandomDeparture = async () => {
    const active = employees.filter((e) => e.status === 'active');
    if (active.length === 0) return;
    const randomEmp = active[Math.floor(Math.random() * active.length)];
    setSelectedEmpForExit(randomEmp);
  };

  if (!isLoggedIn) return null;

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.designation.toLowerCase().includes(q) ||
      emp.employeeCode.toLowerCase().includes(q) ||
      (emp.skills && emp.skills.toLowerCase().includes(q));
    return matchesDept && matchesSearch;
  });

  const totalHeadcount = employees.length;
  const activeHeadcount = employees.filter((e) => e.status === 'active').length;
  const totalAnnualPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const monthlyPayroll = Math.round(totalAnnualPayroll / 12);
  const avgPerformance = (
    employees.reduce((sum, e) => sum + (e.performanceRating || 0), 0) / Math.max(employees.length, 1)
  ).toFixed(1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="zr-subheader-title">Enterprise Payroll System</h1>
              <span className="zr-badge zr-badge-green" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27AE60' }}></span>
                Live Webhook Connected to RMS
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Demonstration Payroll &amp; HRIS Portal — 120+ active workforce identities across 6 core departments
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRandomDeparture}
              className="zr-btn zr-btn-orange zr-btn-sm"
              title="Pick a random employee to offboard"
            >
              🎲 Simulate Random Departure
            </button>
            <button
              onClick={() => handleSeedAll(true)}
              disabled={seeding}
              className="zr-btn zr-btn-outline zr-btn-sm"
            >
              {seeding ? 'Generating...' : '🔄 Reset 120+ Employee Pool'}
            </button>
          </div>
        </div>

        <div className="zr-content" style={{ maxWidth: 1150 }}>
          {/* Notification Toasts */}
          {actionSuccess && (
            <div style={{ background: 'var(--zr-success-light)', border: '1px solid var(--zr-success)', color: 'var(--zr-success)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ {actionSuccess}
            </div>
          )}

          {actionError && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '12px 18px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {actionError}
            </div>
          )}

          {/* Real-time Webhook Success Banner */}
          {lastDispatchedEvent && (
            <div
              style={{
                background: 'linear-gradient(135deg, #F5F0FF 0%, #EEF4FF 100%)',
                border: '1.5px solid #8B5CF6',
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 20,
                boxShadow: 'var(--zr-shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#5B21B6' }}>
                  <span>🚀</span> Webhook Dispatched to RMS in Real-Time!
                </div>
                <p style={{ fontSize: 12, color: 'var(--zr-text-2)', margin: '4px 0 0' }}>
                  Offboarded <strong>{lastDispatchedEvent.employee.firstName} {lastDispatchedEvent.employee.lastName}</strong> ({lastDispatchedEvent.employee.designation} in {lastDispatchedEvent.employee.department}). The RMS Zia AI has analyzed your talent pool and ranked top internal succession promotions!
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/payroll-mobility">
                  <button className="zr-btn zr-btn-purple zr-btn-sm">
                    🎯 View AI Recommendations in RMS →
                  </button>
                </Link>
                <button onClick={() => setLastDispatchedEvent(null)} className="zr-btn zr-btn-ghost zr-btn-xs">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Top Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Headcount', value: `${activeHeadcount} / ${totalHeadcount}`, color: 'var(--zr-text)', sub: 'Active Workforce' },
              { label: 'Monthly Payroll Run', value: `$${(monthlyPayroll / 1000).toFixed(0)}k / mo`, color: '#1473E6', sub: 'Gross Monthly Payout' },
              { label: 'Annual Compensation', value: `$${(totalAnnualPayroll / 1000000).toFixed(2)}M`, color: '#27AE60', sub: 'Total Salary Budget' },
              { label: 'Avg Appraisal Rating', value: `⭐ ${avgPerformance}`, color: '#E8652A', sub: 'Workforce Performance' },
              { label: 'Active Departments', value: '6 Depts', color: '#8B5CF6', sub: 'Enterprise Units' },
            ].map((st) => (
              <div
                key={st.label}
                className="zr-card"
                style={{ padding: '14px 16px', boxShadow: 'var(--zr-shadow-sm)' }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {st.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: st.color }}>{st.value}</div>
                <div style={{ fontSize: 10, color: 'var(--zr-muted-light)', marginTop: 2 }}>{st.sub}</div>
              </div>
            ))}
          </div>

          {/* Department Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
            {DEPARTMENTS.map((dept) => {
              const count = dept === 'All' ? employees.length : employees.filter((e) => e.department === dept).length;
              const isSelected = selectedDept === dept;
              const icon = DEPT_ICONS[dept] || '🏢';

              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: `1px solid ${isSelected ? 'var(--zr-orange)' : 'var(--zr-border)'}`,
                    background: isSelected ? 'var(--zr-orange-light)' : 'var(--zr-white)',
                    color: isSelected ? 'var(--zr-orange)' : 'var(--zr-text-2)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {dept !== 'All' && <span>{icon}</span>}
                  <span>{dept}</span>
                  <span style={{ fontSize: 10, background: isSelected ? 'var(--zr-orange)' : 'var(--zr-bg)', color: isSelected ? '#fff' : 'var(--zr-muted)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter / Search Bar */}
          <div className="zr-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by employee name, designation, code (e.g. EMP-1015), or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="zr-input"
                style={{ fontSize: 13 }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--zr-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong>{filteredEmployees.length}</strong> of {employees.length} employees
            </div>
          </div>

          {/* Employees Table */}
          <div className="zr-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="zr-table">
                <thead>
                  <tr>
                    <th>Employee / Code</th>
                    <th>Department &amp; Designation</th>
                    <th>Level</th>
                    <th>Compensation</th>
                    <th>Tenure</th>
                    <th>Appraisal</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Payroll Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--zr-muted)' }}>
                        No employees match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const monthly = Math.round((emp.salary || 80000) / 12);
                      const lStyle = LEVEL_COLORS[emp.level] || LEVEL_COLORS.mid;
                      let skillsList: string[] = [];
                      try {
                        skillsList = emp.skills ? JSON.parse(emp.skills) : [];
                      } catch {}

                      return (
                        <tr key={emp.id} style={{ opacity: emp.status === 'offboarded' ? 0.6 : 1 }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, var(--zr-blue) 0%, #4FA4F4 100%)',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                                  {emp.employeeCode} · {emp.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--zr-blue)' }}>
                              {emp.designation}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--zr-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{DEPT_ICONS[emp.department] || '🏢'}</span>
                              <span>{emp.department}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: lStyle.color,
                                background: lStyle.bg,
                                padding: '2px 8px',
                                borderRadius: 12,
                                textTransform: 'uppercase',
                              }}
                            >
                              {emp.level}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--zr-text)' }}>
                              ${monthly.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--zr-muted)', fontWeight: 400 }}>/ mo</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--zr-muted)' }}>
                              ${emp.salary ? emp.salary.toLocaleString() : '85,000'} / yr
                            </div>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--zr-text-2)' }}>
                            {emp.experienceYears} yrs
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 700, color: emp.performanceRating >= 4.5 ? '#27AE60' : '#E8652A' }}>
                              ⭐ {emp.performanceRating.toFixed(1)}
                            </span>
                          </td>
                          <td>
                            <span className={emp.status === 'active' ? 'zr-badge zr-badge-green' : 'zr-badge zr-badge-red'}>
                              {emp.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {emp.status === 'active' ? (
                              <button
                                onClick={() => setSelectedEmpForExit(emp)}
                                className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                                title="Trigger offboarding webhook to RMS"
                              >
                                🚪 Process Offboard
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--zr-muted-light)' }}>Departed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ══ OFFBOARDING / TERMINATION MODAL ══ */}
        {selectedEmpForExit && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 520, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                    🚪 Process Employee Offboarding
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--zr-muted)', margin: '2px 0 0' }}>
                    Will dispatch a real-time departure webhook to the RMS Succession Engine
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmpForExit(null)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Employee Summary Card */}
              <div style={{ background: 'var(--zr-bg)', border: '1px solid var(--zr-border)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, color: 'var(--zr-text)' }}>
                    {selectedEmpForExit.firstName} {selectedEmpForExit.lastName} ({selectedEmpForExit.employeeCode})
                  </strong>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--zr-blue)' }}>
                    ${selectedEmpForExit.salary?.toLocaleString()} / yr
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--zr-text-2)' }}>
                  {selectedEmpForExit.designation} · {selectedEmpForExit.department} ({selectedEmpForExit.experienceYears}y tenure)
                </div>
              </div>

              <form onSubmit={handleDispatchOffboarding}>
                <div style={{ marginBottom: 14 }}>
                  <label className="zr-label">Departure / Exit Reason *</label>
                  <select
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    className="zr-input"
                  >
                    <option value="Resignation / Accepted New Opportunity">Resignation / Accepted New Opportunity</option>
                    <option value="Relocation & Family Move">Relocation &amp; Family Move</option>
                    <option value="Career Transition & Higher Studies">Career Transition &amp; Higher Studies</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Mutual Separation">Mutual Separation</option>
                  </select>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="zr-label">Effective Exit Date</label>
                  <input
                    type="date"
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className="zr-input"
                  />
                </div>

                {/* Webhook JSON Preview */}
                <div style={{ background: '#1E293B', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                    Outgoing Webhook Payload Preview
                  </div>
                  <pre style={{ fontSize: 11, color: '#38BDF8', margin: 0, fontFamily: 'monospace' }}>
{JSON.stringify(
  {
    event: 'EMPLOYEE_OFFBOARDED',
    employeeCode: selectedEmpForExit.employeeCode,
    employeeName: `${selectedEmpForExit.firstName} ${selectedEmpForExit.lastName}`,
    department: selectedEmpForExit.department,
    designation: selectedEmpForExit.designation,
    salary: selectedEmpForExit.salary,
    reason: exitReason,
  },
  null,
  2
)}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedEmpForExit(null)}
                    className="zr-btn zr-btn-ghost zr-btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatching}
                    className="zr-btn zr-btn-orange zr-btn-sm"
                  >
                    {dispatching ? 'Dispatching Webhook...' : '⚡ Offboard & Send Webhook to RMS'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
