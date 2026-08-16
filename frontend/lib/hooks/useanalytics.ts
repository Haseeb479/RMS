import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface ExecutiveKPIs {
  avgTimeToHireDays: number;
  avgTimeToFillDays: number;
  offerAcceptanceRate: number;
  overallConversionRate: number;
  totalActiveCandidates: number;
  totalOpenJobs: number;
  totalHires: number;
  inboundResumesCount: number;
  costPerHireAvg: number;
}

export interface StageVelocity {
  stage: string;
  avgDays: number;
  targetDays: number;
  status: 'ahead' | 'on_track' | 'delayed' | string;
}

export interface FunnelStage {
  stage: string;
  name: string;
  count: number;
  percentage: number;
  conversion: number;
  color: string;
  dropOff: number;
}

export interface DepartmentStat {
  department: string;
  activeHeadcount: number;
  openRequisitions: number;
  recentHires: number;
  avgTimeToHire: number;
  avgSalary: number;
  healthScore: string;
}

export interface ChannelStat {
  channel: string;
  applicants: number;
  interviews: number;
  hires: number;
  hireRate: number;
  qualityScore: number;
  costPerHire: number;
}

export interface RecruiterStat {
  name: string;
  role: string;
  activePipelines: number;
  candidatesScreened: number;
  interviewsHeld: number;
  offersExtended: number;
  hiresClosed: number;
  avgFeedbackHours: number;
}

export interface OfferMetrics {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  acceptanceRate: number;
}

export interface ActivityItem {
  id: string;
  type: string;
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

export type AnalyticsData = ExecutiveAnalyticsData;

export interface ExecutiveAnalyticsData {
  executiveKPIs: ExecutiveKPIs;
  stageVelocities: StageVelocity[];
  funnel: FunnelStage[];
  departmentStats: DepartmentStat[];
  channelStats: ChannelStat[];
  recruiterStats: RecruiterStat[];
  offerMetrics: OfferMetrics;
  recentActivities: ActivityItem[];
  topJobs?: TopJob[];
  quickStats?: any;
}

export function useAnalytics() {
  const [data, setData] = useState<ExecutiveAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (jobId?: string, timeframe: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (jobId) params.append('jobId', jobId);
      if (timeframe) params.append('timeframe', timeframe);

      const response = await api.get(`/company/analytics?${params.toString()}`);
      setData(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch analytics data';
      setError(msg);
      return null;
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
