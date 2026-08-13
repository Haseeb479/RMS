import { prisma } from '../config/database';

export interface CreateJobInput {
  title: string;
  description: string;
  location?: string;
  type?: string;
  salary?: string;
  requirements?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: string;
}

export class JobService {
  // Create a new job
  static async create(companyId: string, data: CreateJobInput) {
    if (!data.title?.trim()) throw new Error('Job title is required');
    if (!data.description?.trim()) throw new Error('Job description is required');

    return await prisma.job.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location?.trim() || null,
        type: data.type || 'full-time',
        salary: data.salary?.trim() || null,
        requirements: data.requirements?.trim() || null,
        companyId,
        status: 'draft',
      },
      include: { _count: { select: { applications: true } } },
    });
  }

  // List all jobs for a company
  static async listByCompany(companyId: string, status?: string) {
    return await prisma.job.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
      },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a single job by ID (must belong to the company)
  static async getById(companyId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId },
      include: {
        _count: { select: { applications: true } },
        applications: {
          include: { candidate: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!job) throw new Error('Job not found');
    return job;
  }

  // Update a job
  static async update(companyId: string, jobId: string, data: UpdateJobInput) {
    // Ensure the job belongs to this company
    const existing = await prisma.job.findFirst({ where: { id: jobId, companyId } });
    if (!existing) throw new Error('Job not found');

    if (data.title !== undefined && data.title.trim() === '') {
      throw new Error('Job title cannot be empty');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.location !== undefined) updateData.location = data.location?.trim() || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.salary !== undefined) updateData.salary = data.salary?.trim() || null;
    if (data.requirements !== undefined) updateData.requirements = data.requirements?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: { _count: { select: { applications: true } } },
    });
  }

  // Publish a job (shortcut to set status = published)
  static async publish(companyId: string, jobId: string) {
    const existing = await prisma.job.findFirst({ where: { id: jobId, companyId } });
    if (!existing) throw new Error('Job not found');

    return await prisma.job.update({
      where: { id: jobId },
      data: { status: 'published' },
      include: { _count: { select: { applications: true } } },
    });
  }

  // Close a job
  static async close(companyId: string, jobId: string) {
    const existing = await prisma.job.findFirst({ where: { id: jobId, companyId } });
    if (!existing) throw new Error('Job not found');

    return await prisma.job.update({
      where: { id: jobId },
      data: { status: 'closed' },
      include: { _count: { select: { applications: true } } },
    });
  }

  // Delete a job (only drafts can be deleted, published must be closed first)
  static async delete(companyId: string, jobId: string) {
    const existing = await prisma.job.findFirst({ where: { id: jobId, companyId } });
    if (!existing) throw new Error('Job not found');

    await prisma.job.delete({ where: { id: jobId } });
    return { deleted: true };
  }

  // Get job stats for a company
  static async getStats(companyId: string) {
    const [total, published, draft, closed] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: 'published' } }),
      prisma.job.count({ where: { companyId, status: 'draft' } }),
      prisma.job.count({ where: { companyId, status: 'closed' } }),
    ]);
    return { total, published, draft, closed };
  }
}
