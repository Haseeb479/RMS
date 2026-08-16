import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SuccessorMatch {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  currentDesignation: string;
  currentLevel: string;
  currentSalary: number | null;
  experienceYears: number;
  performanceRating: number;
  matchScore: number;
  skillsMatch: string[];
  skillsMissing: string[];
  readinessLevel: 'Ready Now' | 'Ready in 3-6 Mo' | 'High Potential';
  recommendationReason: string;
}

export interface DepartureEvent {
  id: string;
  companyId: string;
  employeeId: string | null;
  employeeName: string;
  employeeEmail: string | null;
  department: string;
  designation: string;
  level: string;
  salary: number | null;
  departureDate: string;
  departureReason: string | null;
  source: string;
  status: 'pending_action' | 'promoted_internally' | 'requisition_created' | 'dismissed';
  suggestedSuccessors: string | null;
  selectedSuccessorId: string | null;
  promotedEmployeeName: string | null;
  createdJobId: string | null;
  isCascadingVacancy: boolean;
  cascadedFromRole: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string;
  level: string;
  skills: string | null;
  experienceYears: number;
  salary: number | null;
  performanceRating: number;
  status: 'active' | 'promoted' | 'offboarded' | 'on_leave';
  hireDate: string;
  exitDate: string | null;
  exitReason: string | null;
}

export function useMobility() {
  const [events, setEvents] = useState<DepartureEvent[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─── Events ─── */
  const fetchEvents = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const res = await api.get(`/mobility/events?${params.toString()}`);
      setEvents(res.data.data || []);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch vacancy events');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const promoteEmployee = async (eventId: string, employeeId: string, newSalary?: number) => {
    try {
      const res = await api.post(`/mobility/events/${eventId}/promote`, { employeeId, newSalary });
      // Refresh events
      await fetchEvents();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to execute internal promotion');
    }
  };

  const createJobFromVacancy = async (eventId: string, overrideData: any = {}) => {
    try {
      const res = await api.post(`/mobility/events/${eventId}/create-job`, overrideData);
      await fetchEvents();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create job requisition');
    }
  };

  const dismissEvent = async (eventId: string) => {
    try {
      await api.post(`/mobility/events/${eventId}/dismiss`);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'dismissed' } : e));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to dismiss event');
    }
  };

  /* ─── Employees ─── */
  const fetchEmployees = useCallback(async (filters: any = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/mobility/employees?${params.toString()}`);
      setEmployees(res.data.data || []);
      return res.data.data;
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      return [];
    }
  }, []);

  const createEmployee = async (data: any) => {
    try {
      const res = await api.post('/mobility/employees', data);
      setEmployees(prev => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create employee');
    }
  };

  const seedEmployees = async (force: boolean = false) => {
    try {
      const res = await api.post('/mobility/seed-employees', { force });
      await fetchEmployees();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to seed sample talent');
    }
  };

  /* ─── Simulator ─── */
  const simulateDeparture = async (data: any) => {
    try {
      const res = await api.post('/mobility/simulate-departure', data);
      await fetchEvents();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Simulation failed');
    }
  };

  return {
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
  };
}
