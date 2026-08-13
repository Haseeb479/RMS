import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface FunnelStage {
  stage: string;
  name: string;
  count: number;
  percentage: number;
  conversion: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'candidate' | 'application' | 'interview' | 'job';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  link: string;
}

export interface TopJob {
  id: string;
  title: string;
  status: string;
  applicationsCount: number;
  interviewsCount: number;
}

export interface AnalyticsData {
  quickStats: {
    totalJobs: number;
    publishedJobs: number;
    draftJobs: number;
    closedJobs: number;
    totalCandidates: number;
    candidateStats: Record<string, number>;
    totalApplications: number;
    applicationStats: Record<string, number>;
    totalInterviews: number;
    interviewStats: Record<string, number>;
    conversionRate: number;
  };
  funnel: FunnelStage[];
  topJobs: TopJob[];
  recentActivities: ActivityItem[];
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (jobId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = jobId ? `/company/analytics?jobId=${jobId}` : '/company/analytics';
      const response = await api.get(url);
      setData(response.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch analytics data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
  };
}
