import { prisma } from '../config/database';

export class NotificationService {
  /**
   * Create a new notification alert
   */
  static async createNotification(companyId: string, data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
    meta?: any;
  }) {
    return (prisma as any).notification.create({
      data: {
        companyId,
        title: data.title,
        message: data.message,
        type: data.type || 'general',
        link: data.link || null,
        meta: data.meta ? JSON.stringify(data.meta) : null,
      },
    });
  }

  /**
   * List company notifications
   */
  static async listNotifications(companyId: string, limit: number = 40) {
    // If no notifications exist, seed realistic real-time initial notifications
    const count = await (prisma as any).notification.count({ where: { companyId } });
    if (count === 0) {
      await this.seedSampleNotifications(companyId);
    }

    const notifications = await (prisma as any).notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await (prisma as any).notification.count({
      where: { companyId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(id: string, companyId: string) {
    return (prisma as any).notification.updateMany({
      where: { id, companyId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(companyId: string) {
    return (prisma as any).notification.updateMany({
      where: { companyId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Seed realistic enterprise notifications
   */
  static async seedSampleNotifications(companyId: string) {
    const samples = [
      {
        title: '🤖 Groq AI High ATS Match: 94% on Lead Architect',
        message: 'Candidate Alex Mercer scored 94% match on "Lead Cloud Architect" with high skill overlap in AWS, Kubernetes & Go.',
        type: 'high_ats_match',
        link: '/candidates',
        isRead: false,
      },
      {
        title: '🚪 Payroll Alert: Departure in Supply Chain',
        message: 'Employee David Vance offboarded from Supply Chain Management. Zia AI identified 3 internal succession candidates.',
        type: 'payroll_departure',
        link: '/payroll-mobility',
        isRead: false,
      },
      {
        title: '📬 Inbound Resume Ingested & Parsed',
        message: 'Received new CV for "Senior SAP Consultant". Groq ATS scored candidate at 88% (Top Match Tier).',
        type: 'inbound_resume',
        link: '/sourcing/inbox',
        isRead: false,
      },
      {
        title: '📝 Offer Letter Signed & Accepted',
        message: 'Sarah Jenkins digitally signed and accepted the offer for "Senior ERP Integration Lead" ($125,000/yr).',
        type: 'offer_signed',
        link: '/offers',
        isRead: false,
      },
      {
        title: '📅 Interview Scheduled in 2 Hours',
        message: 'Technical Interview with candidate Marcus Vance for "DevOps Specialist" is scheduled today at 3:00 PM.',
        type: 'interview_alert',
        link: '/interviews',
        isRead: true,
      },
    ];

    for (const s of samples) {
      await (prisma as any).notification.create({
        data: {
          companyId,
          title: s.title,
          message: s.message,
          type: s.type,
          link: s.link,
          isRead: s.isRead,
        },
      });
    }
  }
}
