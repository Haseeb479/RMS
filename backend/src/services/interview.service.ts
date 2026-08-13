import { prisma } from '../config/database';

export interface CreateInterviewInput {
  candidateId: string;
  jobId?: string;
  applicationId?: string;
  title: string;
  type?: string;
  scheduledAt: string | Date;
  duration?: number;
  location?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  status?: string;
}

export interface AddFeedbackInput {
  feedback: string;
  rating?: number;
  recommendation?: string;
  status?: string;
}

export class InterviewService {
  // Schedule a new interview
  static async create(companyId: string, data: CreateInterviewInput) {
    if (!data.candidateId || !data.title || !data.scheduledAt) {
      throw new Error('Candidate ID, Title, and Scheduled Date/Time are required');
    }

    // Verify candidate belongs to company
    const candidate = await prisma.candidate.findFirst({
      where: { id: data.candidateId, companyId },
    });
    if (!candidate) {
      throw new Error('Candidate not found or unauthorized');
    }

    // Verify job if provided
    if (data.jobId) {
      const job = await prisma.job.findFirst({
        where: { id: data.jobId, companyId },
      });
      if (!job) {
        throw new Error('Job not found or unauthorized');
      }
    }

    // Verify application if provided
    if (data.applicationId) {
      const application = await prisma.application.findFirst({
        where: { id: data.applicationId, job: { companyId } },
      });
      if (!application) {
        throw new Error('Application not found or unauthorized');
      }
    }

    const interview = await prisma.interview.create({
      data: {
        companyId,
        candidateId: data.candidateId,
        jobId: data.jobId || null,
        applicationId: data.applicationId || null,
        title: data.title,
        type: data.type || 'technical',
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration || 60,
        location: data.location || null,
        interviewerName: data.interviewerName || null,
        interviewerEmail: data.interviewerEmail || null,
        status: data.status || 'scheduled',
      },
      include: {
        candidate: true,
        job: true,
        application: true,
      },
    });

    // Auto update application status to 'interview' if linked application is in early stages
    if (data.applicationId) {
      await prisma.application.update({
        where: { id: data.applicationId },
        data: { status: 'interview' },
      }).catch(() => {});
    }

    return interview;
  }

  // List interviews for company with filters
  static async listByCompany(
    companyId: string,
    filters: { candidateId?: string; jobId?: string; status?: string; search?: string } = {}
  ) {
    const { candidateId, jobId, status, search } = filters;

    const where: any = { companyId };

    if (candidateId) where.candidateId = candidateId;
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { interviewerName: { contains: search, mode: 'insensitive' } },
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return await prisma.interview.findMany({
      where,
      include: {
        candidate: true,
        job: true,
        application: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  // Get interview by ID
  static async getById(companyId: string, id: string) {
    const interview = await prisma.interview.findFirst({
      where: { id, companyId },
      include: {
        candidate: true,
        job: true,
        application: true,
      },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    return interview;
  }

  // Submit interview feedback & rating
  static async addFeedback(companyId: string, id: string, data: AddFeedbackInput) {
    const existing = await prisma.interview.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new Error('Interview not found');
    }

    if (!data.feedback || data.feedback.trim() === '') {
      throw new Error('Feedback content is required');
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        feedback: data.feedback,
        rating: data.rating !== undefined ? Number(data.rating) : existing.rating,
        recommendation: data.recommendation || existing.recommendation,
        status: data.status || 'completed',
      },
      include: {
        candidate: true,
        job: true,
        application: true,
      },
    });

    return updated;
  }

  // Update interview status (e.g. scheduled, completed, cancelled, rescheduled)
  static async updateStatus(companyId: string, id: string, status: string) {
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = await prisma.interview.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new Error('Interview not found');
    }

    return await prisma.interview.update({
      where: { id },
      data: { status },
      include: {
        candidate: true,
        job: true,
        application: true,
      },
    });
  }

  // Delete interview
  static async delete(companyId: string, id: string) {
    const existing = await prisma.interview.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      throw new Error('Interview not found');
    }

    await prisma.interview.delete({ where: { id } });
    return { deleted: true };
  }
}
