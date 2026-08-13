import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  salary: string | null;
  requirements: string | null;
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
}

export interface JobStats {
  total: number;
  published: number;
  draft: number;
  closed: number;
}

export function useJobs(statusFilter?: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/jobs${params}`);
      setJobs(response.data.data ?? []);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch jobs. Make sure the server is running.';
      setError(msg);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async (data: Partial<Job>) => {
    try {
      const response = await api.post('/jobs', data);
      setJobs(prev => [response.data.data, ...prev]);
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create job');
    }
  };

  const updateJob = async (id: string, data: Partial<Job>) => {
    try {
      const response = await api.patch(`/jobs/${id}`, data);
      setJobs(prev => prev.map(j => j.id === id ? response.data.data : j));
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update job');
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete job');
    }
  };

  const publishJob = async (id: string) => {
    try {
      const response = await api.post(`/jobs/${id}/publish`);
      setJobs(prev => prev.map(j => j.id === id ? response.data.data : j));
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to publish job');
    }
  };

  const closeJob = async (id: string) => {
    try {
      const response = await api.post(`/jobs/${id}/close`);
      setJobs(prev => prev.map(j => j.id === id ? response.data.data : j));
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to close job');
    }
  };

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    publishJob,
    closeJob,
  };
}

export function useJobStats() {
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

export function useJob(id: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/jobs/${id}`)
      .then(r => setJob(r.data.data))
      .catch(e => setError(e.response?.data?.error || 'Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { job, loading, error };
}
