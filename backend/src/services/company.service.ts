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
    if (data.name !== undefined && data.name.trim() === '') {
      throw new Error('Company name cannot be empty');
    }

    // Build update object — only include fields that were explicitly sent
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.logo !== undefined) updateData.logo = data.logo || null;

    return await prisma.company.update({
      where: { id: companyId },
      data: updateData,
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