import { prisma } from '../config/database';

export interface CreateApplicationInput {
  jobId: string;
  candidateId: string;
  status?: string;
}

export class ApplicationService {
  // Create application
  static async create(companyId: string, data: CreateApplicationInput) {
    if (!data.jobId || !data.candidateId) {
      throw new Error('Job ID and Candidate ID are required');
    }

    // Verify job belongs to company
    const job = await prisma.job.findFirst({
      where: { id: data.jobId, companyId },
    });
    if (!job) throw new Error('Job not found or unauthorized');

    // Verify candidate belongs to company
    const candidate = await prisma.candidate.findFirst({
      where: { id: data.candidateId, companyId },
    });
    if (!candidate) throw new Error('Candidate not found or unauthorized');

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: {
        jobId: data.jobId,
        candidateId: data.candidateId,
      },
    });

    if (existing) {
      throw new Error('Candidate has already applied to this job');
    }

    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateId: data.candidateId,
        status: data.status || 'applied',
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    return application;
  }

  // List applications for company with filters
  static async listByCompany(companyId: string, filters: { jobId?: string; status?: string; search?: string } = {}) {
    const { jobId, status, search } = filters;

    const where: any = {
      job: { companyId },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return await prisma.application.findMany({
      where,
      include: {
        job: true,
        candidate: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Get application details by ID
  static async getById(companyId: string, applicationId: string) {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return application;
  }

  // Update application status (Move stage)
  static async updateStatus(companyId: string, applicationId: string, newStatus: string) {
    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status stage. Allowed: ${validStatuses.join(', ')}`);
    }

    // Ensure application belongs to this company
    const existing = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
      include: { candidate: true },
    });

    if (!existing) {
      throw new Error('Application not found');
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
      include: {
        job: true,
        candidate: true,
      },
    });

    // Optionally sync candidate status if hired/rejected
    if (newStatus === 'hired' || newStatus === 'rejected' || newStatus === 'shortlisted') {
      await prisma.candidate.update({
        where: { id: existing.candidateId },
        data: { status: newStatus },
      }).catch(() => {});
    }

    return updated;
  }

  // Delete application
  static async delete(companyId: string, applicationId: string) {
    const existing = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { companyId },
      },
    });

    if (!existing) {
      throw new Error('Application not found');
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    return { deleted: true };
  }
}
