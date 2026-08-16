import { prisma } from '../config/database';
import { AuditService } from './audit.service';

export class CandidateService {
  // Create candidate (Disabled: candidates must apply through portal)
  static async create(companyId: string, data: any) {
    throw new Error('Manual candidate creation is disabled. Candidates must apply through the public job application portal.');
  }

  // List candidates with pagination and filters
  static async list(companyId: string, filters: any = {}) {
    const { status, search, page = 1, limit = 20 } = filters;

    const where: any = { companyId };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter (name, email, or skills)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { skills: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          applications: {
            include: {
              job: {
                select: {
                  id: true,
                  jobCode: true,
                  title: true,
                  status: true,
                  location: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          resumes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return {
      candidates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single candidate with notes
  static async getById(candidateId: string, companyId: string) {
    return await prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
      include: {
        applications: {
          include: {
            job: true,
            answers: {
              include: {
                screeningQuestion: true,
              },
            },
          },
        },
        activityNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Update candidate
  static async update(candidateId: string, companyId: string, data: any) {
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        firstName: data.firstName !== undefined ? data.firstName : undefined,
        lastName: data.lastName !== undefined ? data.lastName : undefined,
        email: data.email !== undefined ? data.email : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        location: data.location !== undefined ? data.location : undefined,
        skills: data.skills !== undefined ? JSON.stringify(data.skills) : undefined,
        tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined,
        experience: data.experience !== undefined ? data.experience : undefined,
        salary: data.salary !== undefined ? data.salary : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        status: data.status !== undefined ? data.status : undefined,
        score: data.score !== undefined ? data.score : undefined,
      },
    });

    if (data.status && data.status !== candidate.status) {
      await AuditService.log(
        companyId,
        'CANDIDATE_STATUS_UPDATED',
        `Updated candidate ${candidate.firstName} ${candidate.lastName} status to ${data.status}`
      );

      // Trigger automated stage workflow rules
      const { WorkflowService } = await import('./workflow.service');
      await WorkflowService.triggerStageWorkflow(companyId, candidateId, data.status);
    }

    return updated;
  }

  // Delete candidate
  static async delete(candidateId: string, companyId: string) {
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Delete related applications first
    await prisma.application.deleteMany({
      where: { candidateId },
    });

    const result = await prisma.candidate.delete({
      where: { id: candidateId },
    });

    await AuditService.log(
      companyId,
      'GDPR_CANDIDATE_DELETION',
      `Permanently deleted candidate ${candidate.firstName} ${candidate.lastName} (${candidate.email}) under GDPR right-to-be-forgotten`
    );

    return result;
  }

  // Get candidate stats
  static async getStats(companyId: string) {
    const statuses = ['new', 'contacted', 'shortlisted', 'rejected', 'hired'];
    
    const stats = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await prisma.candidate.count({
          where: { companyId, status },
        }),
      }))
    );

    return {
      total: await prisma.candidate.count({ where: { companyId } }),
      byStatus: Object.fromEntries(stats.map(s => [s.status, s.count])),
    };
  }

  // ─── Activity Notes ───────────────────────────────────────────────────────
  static async getNotes(candidateId: string, companyId: string) {
    return await (prisma as any).candidateNote.findMany({
      where: { candidateId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async addNote(candidateId: string, companyId: string, data: { content: string; authorName?: string; type?: string }) {
    return await (prisma as any).candidateNote.create({
      data: {
        candidateId,
        companyId,
        content: data.content,
        authorName: data.authorName || 'Recruiter',
        type: data.type || 'note',
      },
    });
  }

  static async deleteNote(noteId: string, companyId: string) {
    const note = await (prisma as any).candidateNote.findFirst({ where: { id: noteId, companyId } });
    if (!note) throw new Error('Note not found');
    return await (prisma as any).candidateNote.delete({ where: { id: noteId } });
  }

  // ─── Duplicate Detection ──────────────────────────────────────────────────
  static async checkDuplicate(email: string, companyId: string) {
    if (!email) return { isDuplicate: false, candidate: null };
    const existing = await prisma.candidate.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, companyId },
      select: { id: true, firstName: true, lastName: true, email: true, status: true, createdAt: true },
    });
    return { isDuplicate: !!existing, candidate: existing };
  }
}