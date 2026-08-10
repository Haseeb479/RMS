import { prisma } from '../config/database';

export class CompanyService {
  // Get company by ID
  static async getById(companyId: string) {
    return await prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  // Update company
  static async update(companyId: string, data: any) {
    // Validate input
    if (data.name && data.name.trim() === '') {
      throw new Error('Company name cannot be empty');
    }

    return await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        logo: data.logo || undefined,
      },
    });
  }

  // Get company stats
  static async getStats(companyId: string) {
    const [jobsCount, candidatesCount, applicationsCount] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.candidate.count({ where: { companyId } }),
      prisma.application.count({
        where: {
          job: { companyId },
        },
      }),
    ]);

    return {
      jobs: jobsCount,
      candidates: candidatesCount,
      applications: applicationsCount,
    };
  }
}