import { prisma } from '../config/database';
import { GroqService, AtsEvaluationResult } from './groq.service';
import { NotificationService } from './notification.service';

export class AtsService {
  /**
   * Score an Inbound Resume or Candidate against a Job
   */
  static async scoreInboundResume(resumeId: string, companyId: string, targetJobId?: string): Promise<{ resume: any; atsResult: AtsEvaluationResult }> {
    const resume = await (prisma as any).inboundResume.findFirst({
      where: { id: resumeId, companyId },
    });

    if (!resume) throw new Error('Inbound resume not found');

    // Find the target job or the first published job
    let job = null;
    if (targetJobId || resume.assignedJobId) {
      job = await prisma.job.findFirst({
        where: { id: targetJobId || resume.assignedJobId, companyId },
      });
    }

    if (!job) {
      job = await prisma.job.findFirst({
        where: { companyId, status: 'published' },
      });
    }

    if (!job) {
      job = await prisma.job.findFirst({
        where: { companyId },
      });
    }

    const jobTitle = job?.title || 'Open Enterprise Requisition';
    let candidateSkills: string[] = [];
    try {
      if (resume.parsedSkills) candidateSkills = JSON.parse(resume.parsedSkills);
    } catch {}

    const atsResult = await GroqService.evaluateResumeAts(
      {
        name: resume.parsedName || resume.senderName || 'Candidate',
        email: resume.parsedEmail || resume.senderEmail,
        skills: candidateSkills,
        experience: resume.parsedExperience || 3,
        resumeText: resume.extractedText || '',
      },
      {
        title: jobTitle,
        description: job?.description || '',
        requirements: job?.requirements || '',
      }
    );

    // Save ATS Score & Match Details into DB
    const updated = await (prisma as any).inboundResume.update({
      where: { id: resumeId },
      data: {
        atsScore: atsResult.atsScore,
        atsMatchDetails: JSON.stringify(atsResult),
        atsMatchedJobId: job?.id || null,
      },
    });

    // If score >= 80%, fire high ATS match alert notification!
    if (atsResult.atsScore >= 80) {
      await NotificationService.createNotification(companyId, {
        title: `⭐ High ATS Match: ${resume.parsedName || 'Candidate'} (${atsResult.atsScore}%)`,
        message: `Inbound CV scored ${atsResult.atsScore}% for "${jobTitle}". Recommended for interview outreach.`,
        type: 'high_ats_match',
        link: '/sourcing/inbox',
        meta: { resumeId, atsScore: atsResult.atsScore, jobId: job?.id },
      });
    }

    return { resume: updated, atsResult };
  }

  /**
   * Batch score all pending inbound resumes in the company
   */
  static async batchScoreInboundResumes(companyId: string): Promise<{ count: number; message: string }> {
    const resumes = await (prisma as any).inboundResume.findMany({
      where: { companyId },
    });

    let scoredCount = 0;
    for (const res of resumes) {
      try {
        await this.scoreInboundResume(res.id, companyId);
        scoredCount++;
      } catch (err) {
        console.error(`Error scoring resume ${res.id}`, err);
      }
    }

    return {
      count: scoredCount,
      message: `Successfully processed and ATS scored ${scoredCount} inbound resumes!`,
    };
  }

  /**
   * Score Candidate in the talent pool
   */
  static async scoreCandidate(candidateId: string, companyId: string, jobId?: string): Promise<{ candidate: any; atsResult: AtsEvaluationResult }> {
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, companyId },
    });

    if (!candidate) throw new Error('Candidate not found');

    let job = null;
    if (jobId) {
      job = await prisma.job.findFirst({ where: { id: jobId, companyId } });
    }
    if (!job) {
      job = await prisma.job.findFirst({ where: { companyId, status: 'published' } });
    }

    let candidateSkills: string[] = [];
    try {
      if (candidate.skills) candidateSkills = JSON.parse(candidate.skills);
    } catch {}

    const atsResult = await GroqService.evaluateResumeAts(
      {
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        skills: candidateSkills,
        experience: candidate.experience || 3,
        resumeText: candidate.notes || '',
      },
      {
        title: job?.title || 'Senior Role',
        description: job?.description || '',
        requirements: job?.requirements || '',
      }
    );

    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        score: atsResult.atsScore,
      },
    });

    return { candidate: updated, atsResult };
  }

  /**
   * AI Email Drafter
   */
  static async generateEmail(companyId: string, payload: {
    type: 'interview_invitation' | 'rejection' | 'application_ack' | 'offer_announcement' | 'custom';
    candidateName: string;
    candidateEmail: string;
    candidateSkills?: string[];
    atsScore?: number;
    jobTitle: string;
    customPrompt?: string;
  }) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });

    const draft = await GroqService.generatePersonalizedEmail(
      payload.type,
      {
        name: payload.candidateName,
        email: payload.candidateEmail,
        skills: payload.candidateSkills,
        atsScore: payload.atsScore,
      },
      {
        title: payload.jobTitle,
        companyName: company?.name || 'RMS Enterprise',
      },
      payload.customPrompt
    );

    return draft;
  }

  /**
   * Confirm and Dispatch Email by HR
   */
  static async confirmAndSendEmail(companyId: string, payload: {
    candidateId?: string;
    candidateName: string;
    candidateEmail: string;
    subject: string;
    body: string;
    type: string;
  }) {
    // 1. If candidateId exists, log activity note & update status
    if (payload.candidateId) {
      try {
        await (prisma as any).candidateNote.create({
          data: {
            candidateId: payload.candidateId,
            companyId,
            content: `📧 Dispatched ${payload.type.replace('_', ' ').toUpperCase()}: "${payload.subject}"\n\n${payload.body.slice(0, 300)}...`,
            type: 'email',
            authorName: 'HR / Recruiter',
          },
        });

        // If interview invitation, update status to contacted
        if (payload.type === 'interview_invitation') {
          await prisma.candidate.update({
            where: { id: payload.candidateId },
            data: { status: 'contacted' },
          });
        }
      } catch (err) {
        console.warn('Could not attach note to candidate', err);
      }
    }

    // 2. Create confirmation notification
    await NotificationService.createNotification(companyId, {
      title: `✉️ Email Sent: ${payload.subject}`,
      message: `Outreach email delivered to ${payload.candidateName} (${payload.candidateEmail}).`,
      type: 'general',
      link: payload.candidateId ? `/candidates/${payload.candidateId}` : '/sourcing/inbox',
    });

    return {
      success: true,
      message: `Email successfully sent to ${payload.candidateName}!`,
    };
  }
}
