import { useState } from 'react';
import { api } from '@/lib/api';

export function useCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
      if (filters.page) params.append('page', String(filters.page));

      const response = await api.get(`/candidates?${params.toString()}`);
      setCandidates(response.data.data.candidates ?? []);
      setPagination(response.data.data.pagination);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch candidates. Make sure the server is running.';
      setError(msg);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/candidates/stats');
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Error fetching candidate stats:', err.response?.data?.error || err.message);
    }
  };

  const createCandidate = async (data: any) => {
    try {
      const response = await api.post('/candidates', data);
      setCandidates(prev => [response.data.data, ...prev]);
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create candidate');
    }
  };

  const updateCandidate = async (candidateId: string, data: any) => {
    try {
      const response = await api.patch(`/candidates/${candidateId}`, data);
      setCandidates(prev => prev.map(c => c.id === candidateId ? response.data.data : c));
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update candidate');
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    try {
      await api.delete(`/candidates/${candidateId}`);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete candidate');
    }
  };

  const getCandidate = async (candidateId: string) => {
    try {
      const response = await api.get(`/candidates/${candidateId}`);
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to fetch candidate');
    }
  };

  // ─── Notes ────────────────────────────────────────────────────────────────
  const getNotes = async (candidateId: string) => {
    try {
      const response = await api.get(`/candidates/${candidateId}/notes`);
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to fetch notes');
    }
  };

  const addNote = async (candidateId: string, content: string, authorName?: string, type?: string) => {
    try {
      const response = await api.post(`/candidates/${candidateId}/notes`, { content, authorName, type });
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to add note');
    }
  };

  const deleteNote = async (candidateId: string, noteId: string) => {
    try {
      await api.delete(`/candidates/${candidateId}/notes/${noteId}`);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete note');
    }
  };

  // ─── Duplicate Detection ──────────────────────────────────────────────────
  const checkDuplicate = async (email: string) => {
    try {
      const response = await api.get(`/candidates/check-duplicate?email=${encodeURIComponent(email)}`);
      return response.data.data as { isDuplicate: boolean; candidate: any };
    } catch {
      return { isDuplicate: false, candidate: null };
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
    getNotes,
    addNote,
    deleteNote,
    checkDuplicate,
  };
}