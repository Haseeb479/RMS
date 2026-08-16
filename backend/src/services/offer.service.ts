import { prisma } from '../config/database';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import crypto from 'crypto';

export class OfferService {
  static async createOffer(companyId: string, data: any) {
    if (!data.candidateId || !data.title || !data.salary || !data.startDate) {
      throw new Error('Candidate, Offer Title, Salary, and Start Date are required.');
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: data.candidateId, companyId },
    });

    if (!candidate) {
      throw new Error('Candidate not found.');
    }

    const token = crypto.randomBytes(16).toString('hex');

    const offer = await prisma.offerLetter.create({
      data: {
        companyId,
        candidateId: data.candidateId,
        jobId: data.jobId || null,
        applicationId: data.applicationId || null,
        title: data.title.trim(),
        salary: data.salary.trim(),
        startDate: new Date(data.startDate),
        content: data.content || `Dear ${candidate.firstName},\n\nWe are pleased to offer you the position of ${data.title} at an annual salary of ${data.salary}.\n\nYour tentative start date will be ${new Date(data.startDate).toLocaleDateString()}.\n\nPlease review and sign this offer letter online.`,
        status: 'sent',
        token,
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    await AuditService.log(
      companyId,
      'OFFER_LETTER_CREATED',
      `Issued offer letter "${offer.title}" to ${candidate.firstName} ${candidate.lastName} (${candidate.email})`
    );

    // 🔔 Real-time notification
    NotificationService.createNotification(companyId, {
      title: `📝 Offer Issued: ${candidate.firstName} ${candidate.lastName}`,
      message: `Offer sent for "${offer.title}" (${offer.salary}). Direct signing link created.`,
      type: 'offer_signed',
      link: '/offers',
    }).catch(() => {});

    return offer;
  }

  static async listOffers(companyId: string) {
    return await prisma.offerLetter.findMany({
      where: { companyId },
      include: {
        candidate: true,
        job: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOfferByToken(token: string) {
    const offer = await prisma.offerLetter.findUnique({
      where: { token },
      include: {
        candidate: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobCode: true,
          },
        },
      },
    });

    if (!offer) {
      throw new Error('Offer letter link invalid or expired.');
    }

    return offer;
  }

  static async respondOffer(token: string, action: 'accept' | 'decline', candidateNotes?: string) {
    const offer = await prisma.offerLetter.findUnique({
      where: { token },
      include: { candidate: true },
    });

    if (!offer) {
      throw new Error('Offer letter not found.');
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const updated = await prisma.offerLetter.update({
      where: { token },
      data: {
        status: newStatus,
        candidateNotes: candidateNotes ? candidateNotes.trim() : null,
        signedAt: action === 'accept' ? new Date() : null,
      },
    });

    // Also update candidate status if accepted
    if (action === 'accept') {
      await prisma.candidate.update({
        where: { id: offer.candidateId },
        data: { status: 'hired' },
      });
    }

    await AuditService.log(
      offer.companyId,
      action === 'accept' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED',
      `Candidate ${offer.candidate.firstName} ${offer.candidate.lastName} ${action}ed job offer "${offer.title}"`
    );

    // 🔔 Real-time notification
    NotificationService.createNotification(offer.companyId, {
      title: action === 'accept' ? `🎉 Offer Accepted: ${offer.candidate.firstName} ${offer.candidate.lastName}` : `⚠️ Offer Declined: ${offer.candidate.firstName} ${offer.candidate.lastName}`,
      message: `${offer.candidate.firstName} ${offer.candidate.lastName} has ${action}ed the offer for "${offer.title}".`,
      type: 'offer_signed',
      link: '/offers',
    }).catch(() => {});

    return updated;
  }
}
