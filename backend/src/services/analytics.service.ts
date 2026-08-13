import { prisma } from '../config/database';

export interface ActivityItem {
  id: string;
  type: 'candidate' | 'application' | 'interview' | 'job';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  link: string;
}

export class AnalyticsService {
  static async getCompanyAnalytics(companyId: string, jobId?: string) {
    const jobWhere = jobId ? { id: jobId, companyId } : { companyId };
    const appWhere = jobId ? { jobId, job: { companyId } } : { job: { companyId } };
    const interviewWhere = jobId ? { jobId, companyId } : { companyId };

    // 1. Fetch Parallel Counts
    const [
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      totalCandidates,
      candidateStatusGroup,
      totalApplications,
      applicationStatusGroup,
      totalInterviews,
      interviewStatusGroup,
      topJobs,
      recentCandidates,
      recentApplications,
      recentInterviews,
      recentJobs,
    ] = await Promise.all([
      prisma.job.count({ where: jobWhere }),
      prisma.job.count({ where: { ...jobWhere, status: 'published' } }),
      prisma.job.count({ where: { ...jobWhere, status: 'draft' } }),
      prisma.job.count({ where: { ...jobWhere, status: 'closed' } }),

      prisma.candidate.count({ where: { companyId } }),
      prisma.candidate.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { _all: true },
      }),

      prisma.application.count({ where: appWhere }),
      prisma.application.groupBy({
        by: ['status'],
        where: appWhere,
        _count: { _all: true },
      }),

      prisma.interview.count({ where: interviewWhere }),
      prisma.interview.groupBy({
        by: ['status'],
        where: interviewWhere,
        _count: { _all: true },
      }),

      // Top Jobs with counts
      prisma.job.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { applications: true, interviews: true },
          },
        },
      }),

      // Recent items for activity log
      prisma.candidate.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        where: appWhere,
        take: 8,
        orderBy: { updatedAt: 'desc' },
        include: { candidate: true, job: true },
      }),
      prisma.interview.findMany({
        where: interviewWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { candidate: true, job: true },
      }),
      prisma.job.findMany({
        where: { companyId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    // Map candidate status counts
    const candidateStats = {
      new: 0,
      contacted: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    candidateStatusGroup.forEach((g) => {
      if (g.status in candidateStats) {
        candidateStats[g.status as keyof typeof candidateStats] = g._count._all;
      }
    });

    // Map application status counts
    const applicationStats = {
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    };
    applicationStatusGroup.forEach((g) => {
      if (g.status in applicationStats) {
        applicationStats[g.status as keyof typeof applicationStats] = g._count._all;
      }
    });

    // Map interview status counts
    const interviewStats = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      rescheduled: 0,
    };
    interviewStatusGroup.forEach((g) => {
      if (g.status in interviewStats) {
        interviewStats[g.status as keyof typeof interviewStats] = g._count._all;
      }
    });

    // 2. Build Hiring Funnel
    // Funnel stages: Applied -> Screening -> Interview -> Offer -> Hired
    // Cumulative logic for funnel flow or actual stage breakdown
    const rawApplied = applicationStats.applied + applicationStats.screening + applicationStats.interview + applicationStats.offer + applicationStats.hired + applicationStats.rejected;
    const countApplied = rawApplied || totalApplications;
    const countScreening = applicationStats.screening + applicationStats.interview + applicationStats.offer + applicationStats.hired;
    const countInterview = applicationStats.interview + applicationStats.offer + applicationStats.hired;
    const countOffer = applicationStats.offer + applicationStats.hired;
    const countHired = applicationStats.hired;

    const funnelStages = [
      {
        stage: 'applied',
        name: 'Applications Received',
        count: countApplied,
        percentage: 100,
        conversion: 100,
        color: '#6366f1',
      },
      {
        stage: 'screening',
        name: 'Screened & Qualified',
        count: countScreening,
        percentage: countApplied > 0 ? Math.round((countScreening / countApplied) * 100) : 0,
        conversion: countApplied > 0 ? Math.round((countScreening / countApplied) * 100) : 0,
        color: '#3b82f6',
      },
      {
        stage: 'interview',
        name: 'Interviews Conducted',
        count: countInterview,
        percentage: countApplied > 0 ? Math.round((countInterview / countApplied) * 100) : 0,
        conversion: countScreening > 0 ? Math.round((countInterview / countScreening) * 100) : 0,
        color: '#a855f7',
      },
      {
        stage: 'offer',
        name: 'Offers Extended',
        count: countOffer,
        percentage: countApplied > 0 ? Math.round((countOffer / countApplied) * 100) : 0,
        conversion: countInterview > 0 ? Math.round((countOffer / countInterview) * 100) : 0,
        color: '#ec4899',
      },
      {
        stage: 'hired',
        name: 'Successful Hires',
        count: countHired,
        percentage: countApplied > 0 ? Math.round((countHired / countApplied) * 100) : 0,
        conversion: countOffer > 0 ? Math.round((countHired / countOffer) * 100) : 0,
        color: '#10b981',
      },
    ];

    // 3. Build Recent Activity Log
    const activities: ActivityItem[] = [];

    recentCandidates.forEach((c) => {
      activities.push({
        id: `c_${c.id}`,
        type: 'candidate',
        title: 'New Candidate Added',
        description: `${c.firstName} ${c.lastName} joined talent pool`,
        timestamp: c.createdAt,
        status: c.status,
        link: `/candidates/${c.id}`,
      });
    });

    recentApplications.forEach((a) => {
      activities.push({
        id: `a_${a.id}`,
        type: 'application',
        title: `Application Moved to ${a.status.toUpperCase()}`,
        description: `${a.candidate?.firstName} ${a.candidate?.lastName} • ${a.job?.title}`,
        timestamp: a.updatedAt,
        status: a.status,
        link: '/applications',
      });
    });

    recentInterviews.forEach((i) => {
      activities.push({
        id: `i_${i.id}`,
        type: 'interview',
        title: `Interview ${i.status.toUpperCase()}`,
        description: `${i.title} with ${i.candidate?.firstName} ${i.candidate?.lastName}`,
        timestamp: i.createdAt,
        status: i.status,
        link: '/interviews',
      });
    });

    recentJobs.forEach((j) => {
      activities.push({
        id: `j_${j.id}`,
        type: 'job',
        title: `Job ${j.status === 'published' ? 'Published' : 'Updated'}`,
        description: `Position "${j.title}" is now ${j.status}`,
        timestamp: j.updatedAt,
        status: j.status,
        link: `/jobs/${j.id}`,
      });
    });

    // Sort descending by timestamp and take top 12
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = activities.slice(0, 12);

    // Calculate hiring conversion rate
    const conversionRate = totalApplications > 0
      ? Math.round((countHired / totalApplications) * 100 * 10) / 10
      : 0;

    return {
      quickStats: {
        totalJobs,
        publishedJobs,
        draftJobs,
        closedJobs,
        totalCandidates,
        candidateStats,
        totalApplications,
        applicationStats,
        totalInterviews,
        interviewStats,
        conversionRate,
      },
      funnel: funnelStages,
      topJobs: topJobs.map((j) => ({
        id: j.id,
        title: j.title,
        status: j.status,
        applicationsCount: j._count.applications,
        interviewsCount: j._count.interviews,
      })),
      recentActivities,
    };
  }
}
