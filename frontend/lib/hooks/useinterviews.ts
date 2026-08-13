import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface InterviewItem {
  id: string;
  companyId: string;
  candidateId: string;
  jobId?: string | null;
  applicationId?: string | null;
  title: string;
  type: string; // screening | technical | behavioral | hr | final
  scheduledAt: string;
  duration: number; // in minutes
  location?: string | null;
  interviewerName?: string | null;
  interviewerEmail?: string | null;
  status: string; // scheduled | completed | cancelled | rescheduled
  feedback?: string | null;
  rating?: number | null; // 1-5 scale
  recommendation?: string | null; // strong_hire | hire | reconsider | reject
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  job?: {
    id: string;
    title: string;
    location?: string | null;
  } | null;
}

export interface ScheduleInterviewData {
  candidateId: string;
  jobId?: string;
  applicationId?: string;
  title: string;
  type?: string;
  scheduledAt: string;
  duration?: number;
  location?: string;
  interviewerName?: string;
  interviewerEmail?: string;
}

export interface InterviewFeedbackData {
  feedback: string;
  rating?: number;
  recommendation?: string;
  status?: string;
}

export function useInterviews() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async (filters: { candidateId?: string; jobId?: string; status?: string; search?: string } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.candidateId) params.append('candidateId', filters.candidateId);
      if (filters.jobId) params.append('jobId', filters.jobId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/interviews?${params.toString()}`);
      setInterviews(response.data.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch interviews';
      setError(msg);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleInterview = async (data: ScheduleInterviewData) => {
    try {
      setError(null);
      const response = await api.post('/interviews', data);
      const newInterview: InterviewItem = response.data.data;
      setInterviews((prev) => [newInterview, ...prev]);
      return newInterview;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to schedule interview';
      setError(msg);
      throw new Error(msg);
    }
  };

  const addFeedback = async (id: string, data: InterviewFeedbackData) => {
    try {
      setError(null);
      const response = await api.post(`/interviews/${id}/feedback`, data);
      const updated: InterviewItem = response.data.data;
      setInterviews((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit interview feedback';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setError(null);
      const response = await api.patch(`/interviews/${id}/status`, { status });
      const updated: InterviewItem = response.data.data;
      setInterviews((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update interview status';
      setError(msg);
      throw new Error(msg);
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      setError(null);
      await api.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete interview';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    interviews,
    loading,
    error,
    fetchInterviews,
    scheduleInterview,
    addFeedback,
    updateStatus,
    deleteInterview,
  };
}
