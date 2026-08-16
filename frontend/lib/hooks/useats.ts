import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface AtsEvaluationResult {
  atsScore: number;
  tier: 'top' | 'moderate' | 'low';
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  recommendationReason: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export function useAts() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const scoreResume = useCallback(async (resumeId: string, jobId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/ats/score-resume', { resumeId, jobId });
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to score resume';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const batchScoreInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/ats/batch-score-inbox');
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to batch score inbox';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const scoreCandidate = useCallback(async (candidateId: string, jobId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/ats/score-candidate', { candidateId, jobId });
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to score candidate';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateEmail = useCallback(async (payload: {
    type: 'interview_invitation' | 'rejection' | 'application_ack' | 'offer_announcement' | 'custom';
    candidateName: string;
    candidateEmail: string;
    candidateSkills?: string[];
    atsScore?: number;
    jobTitle: string;
    customPrompt?: string;
  }): Promise<GeneratedEmail> => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/ats/generate-email', payload);
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate AI email';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (payload: {
    candidateId?: string;
    candidateName: string;
    candidateEmail: string;
    subject: string;
    body: string;
    type: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/ats/send-email', payload);
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to send email';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    scoreResume,
    batchScoreInbox,
    scoreCandidate,
    generateEmail,
    sendEmail,
  };
}
