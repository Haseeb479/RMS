import { prisma } from '../config/database';

export class CandidateService {
  // Create candidate
  static async create(companyId: string, data: any) {
    if (!data.firstName || !data.lastName || !data.email) {
      throw new Error('First name, last name, and email are required');
    }

    // Check if email already exists for this company
    const existing = await prisma.candidate.findFirst({
      where: { email: data.email, companyId },
    });

    if (existing) {
      throw new Error('Candidate with this email already exists');
    }

    return await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        skills: data.skills ? JSON.stringify(data.skills) : null,
        experience: data.experience,
        salary: data.salary,
        notes: data.notes,
        status: 'new',
        companyId,
      },
    });
  }

  // List candidates with pagination and filters
  static async list(companyId: string, filters: any = {}) {
    const { status, search, page = 1, limit = 20 } = filters;

    const where: any = { companyId };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter (name or email)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  // Get single candidate
  static async getById(candidateId: string, companyId: string) {
    return await prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
      include: {
        applications: {
          include: { job: true },
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

    return await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        location: data.location || undefined,
        skills: data.skills ? JSON.stringify(data.skills) : undefined,
        experience: data.experience || undefined,
        salary: data.salary || undefined,
        notes: data.notes || undefined,
        status: data.status || undefined,
        score: data.score || undefined,
      },
    });
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

    return await prisma.candidate.delete({
      where: { id: candidateId },
    });
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
}