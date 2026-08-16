import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface InboundResumeItem {
  id: string;
  senderEmail: string;
  senderName?: string | null;
  subject?: string | null;
  source: string;
  status: 'pending' | 'processed' | 'archived';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string | null;
  parsedName?: string | null;
  parsedEmail?: string | null;
  parsedPhone?: string | null;
  parsedSkills?: string | null;
  parsedExperience?: number | null;
  atsScore?: number | null;
  atsMatchDetails?: string | null;
  atsMatchedJobId?: string | null;
  assignedJobId?: string | null;
  candidateId?: string | null;
  assignedJob?: {
    id: string;
    title: string;
    jobCode: number;
    location?: string | null;
  } | null;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function useInbox() {
  const [inboxItems, setInboxItems] = useState<InboundResumeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = status && status !== 'all' ? `/inbox?status=${status}` : '/inbox';
      const res = await api.get(url);
      setInboxItems(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch Resume Inbox items.');
      setInboxItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const convertResume = async (id: string, jobId?: string) => {
    try {
      const res = await api.post(`/inbox/${id}/convert`, { jobId });
      await fetchInbox();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to convert resume.');
    }
  };

  const deleteResume = async (id: string) => {
    try {
      await api.delete(`/inbox/${id}`);
      setInboxItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete resume.');
    }
  };

  return {
    inboxItems,
    loading,
    error,
    fetchInbox,
    convertResume,
    deleteResume,
  };
}
