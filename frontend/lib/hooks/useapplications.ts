import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface ApplicationCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  resume?: string | null;
  skills?: string | null;
  experience?: number | null;
  salary?: number | null;
  notes?: string | null;
  status?: string;
  score?: number | null;
}

export interface ApplicationJob {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  type: string;
  salary?: string | null;
  status: string;
}

export interface ApplicationItem {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job: ApplicationJob;
  candidate: ApplicationCandidate;
}

export interface FetchApplicationsFilters {
  jobId?: string;
  status?: string;
  search?: string;
}

export function useApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async (filters: FetchApplicationsFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.jobId) params.append('jobId', filters.jobId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/applications?${params.toString()}`);
      setApplications(response.data.data || []);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch applications. Make sure the backend server is running.';
      setError(msg);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApplication = async (data: { jobId: string; candidateId: string; status?: string }) => {
    try {
      setError(null);
      const response = await api.post('/applications', data);
      const newApp: ApplicationItem = response.data.data;
      setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
      return newApp;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create application';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    // Save original for rollback if error
    let previousApplications: ApplicationItem[] = [];
    setApplications((prev) => {
      previousApplications = prev;
      return prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } : app
      );
    });

    try {
      setError(null);
      const response = await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      const updatedApp: ApplicationItem = response.data.data;
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? updatedApp : app))
      );
      return updatedApp;
    } catch (err: any) {
      // Rollback optimistic update
      setApplications(previousApplications);
      const msg = err.response?.data?.error || err.message || 'Failed to update application stage';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    try {
      setError(null);
      await api.delete(`/applications/${applicationId}`);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete application';
      setError(msg);
      throw new Error(msg);
    }
  };

  const getApplication = async (applicationId: string) => {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return response.data.data as ApplicationItem;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to fetch application details');
    }
  };

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplicationStatus,
    deleteApplication,
    getApplication,
  };
}
