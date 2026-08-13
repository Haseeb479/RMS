import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchCandidates = async (filters: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      
      const response = await api.get(`/candidates?${params.toString()}`);
      setCandidates(response.data.data.candidates);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/candidates/stats');
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  const createCandidate = async (data: any) => {
    try {
      const response = await api.post('/candidates', data);
      setCandidates([response.data.data, ...candidates]);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const updateCandidate = async (candidateId: string, data: any) => {
    try {
      const response = await api.patch(`/candidates/${candidateId}`, data);
      setCandidates(candidates.map(c => c.id === candidateId ? response.data.data : c));
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    try {
      await api.delete(`/candidates/${candidateId}`);
      setCandidates(candidates.filter(c => c.id !== candidateId));
    } catch (err: any) {
      throw err;
    }
  };

  const getCandidate = async (candidateId: string) => {
    try {
      const response = await api.get(`/candidates/${candidateId}`);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  return {
    candidates,
    loading,
    error,
    pagination,
    stats,
    fetchCandidates,
    fetchStats,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidate,
  };
}