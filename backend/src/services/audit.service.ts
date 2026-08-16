import { prisma } from '../config/database';

export class AuditService {
  static async log(companyId: string, action: string, details?: string, userId?: string, ipAddress?: string) {
    try {
      return await prisma.auditLog.create({
        data: {
          companyId,
          action,
          details,
          userId: userId || null,
          ipAddress: ipAddress || null,
        },
      });
    } catch (err) {
      console.error('AuditLog creation error:', err);
    }
  }

  static async getLogs(companyId: string, limit = 50) {
    return await prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
