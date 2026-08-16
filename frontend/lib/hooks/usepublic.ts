import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  type: string;
  salary?: string | null;
  requirements?: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    website?: string | null;
    description?: string | null;
    logo?: string | null;
    careerHeadline?: string | null;
    careerSubtitle?: string | null;
    careerColor?: string | null;
    careerBanner?: string | null;
  };
  questions?: Array<{
    id: string;
    question: string;
    type: string;
    options?: any;
    isRequired?: boolean;
  }>;
}

export interface PublicCompanyCareers {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
  logo?: string | null;
  careerHeadline?: string | null;
  careerSubtitle?: string | null;
  careerBanner?: string | null;
  careerColor?: string | null;
  careerPerks?: any;
  socialLinks?: any;
  jobs: Array<{
    id: string;
    jobCode?: number;
    title: string;
    description: string;
    location?: string | null;
    type: string;
    salary?: string | null;
    requirements?: string | null;
    createdAt: string;
  }>;
}

export function usePublic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPublicJob = useCallback(async (jobId: string): Promise<PublicJob> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/public/jobs/${jobId}`);
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Job opening not found';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompanyCareers = useCallback(async (companySlug: string): Promise<PublicCompanyCareers> => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/public/careers/${companySlug}`);
      return res.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Company careers portal not found';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = useCallback(async (formData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_BASE_URL}/public/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to submit job application';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPublicJob,
    getCompanyCareers,
    submitApplication,
  };
}
