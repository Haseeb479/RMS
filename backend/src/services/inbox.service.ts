import { prisma } from '../config/database';
import { ResumeService } from './resume.service';
import { AuditService } from './audit.service';

export interface IngestInboundResumeData {
  companySlug: string;
  senderEmail: string;
  senderName?: string;
  subject?: string;
  source?: string;
  file: Express.Multer.File;
}

export class InboxService {
  // Ingest incoming resume from email webhook or dropzone
  static async ingest(data: IngestInboundResumeData) {
    const { companySlug, senderEmail, senderName, subject, source = 'email_inbox', file } = data;

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      throw new Error(`Company with slug "${companySlug}" not found.`);
    }

    // Extract text from uploaded document
    const extractedText = await ResumeService.extractTextFromFile(file);

    // Parse resume details (Name, Email, Phone, Skills, Experience)
    const parsed = ResumeService.parseResumeData(extractedText);

    const parsedName = parsed.firstName && parsed.lastName
      ? `${parsed.firstName} ${parsed.lastName}`
      : senderName || null;

    const parsedSkillsJson = parsed.skills ? JSON.stringify(parsed.skills) : null;

    // Create inbound resume record
    const inbound = await prisma.inboundResume.create({
      data: {
        companyId: company.id,
        senderEmail,
        senderName: senderName || null,
        subject: subject || 'Resume Application via Email Inbox',
        source,
        status: 'pending',
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        extractedText: extractedText || null,
        parsedName,
        parsedEmail: parsed.email || senderEmail,
        parsedPhone: parsed.phone || null,
        parsedSkills: parsedSkillsJson,
        parsedExperience: parsed.experience || null,
      },
    });

    // Log audit event
    await AuditService.log(
      company.id,
      'INBOUND_RESUME_INGESTED',
      `Resume "${file.originalname}" received from ${senderEmail} via ${source}`
    );

    return inbound;
  }

  // List all inbound resumes for a company
  static async list(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status && status !== 'all') {
      where.status = status;
    }

    return await prisma.inboundResume.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedJob: {
          select: {
            id: true,
            title: true,
            jobCode: true,
            location: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  // Convert inbound resume into an active candidate & link to an optional job opening
  static async convertToCandidate(companyId: string, inboundId: string, jobId?: string) {
    const inbound = await prisma.inboundResume.findFirst({
      where: { id: inboundId, companyId },
    });

    if (!inbound) {
      throw new Error('Inbound resume not found.');
    }

    const email = inbound.parsedEmail || inbound.senderEmail;
    const nameParts = (inbound.parsedName || 'Applicant').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Applicant';
    const lastName = nameParts.slice(1).join(' ') || 'Candidate';

    // Find or create candidate
    let candidate = await prisma.candidate.findFirst({
      where: { email, companyId },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          companyId,
          firstName,
          lastName,
          email,
          phone: inbound.parsedPhone || null,
          skills: inbound.parsedSkills || null,
          experience: inbound.parsedExperience || null,
          resume: inbound.filePath,
          status: 'new',
          notes: `Imported from Resume Inbox (${inbound.source}) on ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // Attach resume file to candidate's documents
    await prisma.resume.create({
      data: {
        companyId,
        candidateId: candidate.id,
        fileName: inbound.fileName,
        filePath: inbound.filePath,
        fileSize: inbound.fileSize,
        mimeType: inbound.mimeType,
        extractedText: inbound.extractedText,
      },
    });

    // If job was selected, link application
    if (jobId) {
      const existingApp = await prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId,
            candidateId: candidate.id,
          },
        },
      });

      if (!existingApp) {
        await prisma.application.create({
          data: {
            jobId,
            candidateId: candidate.id,
            status: 'applied',
          },
        });
      }
    }

    // Update inbound record to processed
    const updated = await prisma.inboundResume.update({
      where: { id: inboundId },
      data: {
        status: 'processed',
        candidateId: candidate.id,
        assignedJobId: jobId || null,
      },
      include: {
        assignedJob: true,
        candidate: true,
      },
    });

    // Log audit event
    await AuditService.log(
      companyId,
      'INBOUND_RESUME_PROCESSED',
      `Inbound resume "${inbound.fileName}" converted to candidate ${firstName} ${lastName}${jobId ? ` and assigned to job` : ''}`
    );

    return { inbound: updated, candidate };
  }

  // Archive / Delete inbound resume
  static async delete(companyId: string, inboundId: string) {
    const inbound = await prisma.inboundResume.findFirst({
      where: { id: inboundId, companyId },
    });

    if (!inbound) {
      throw new Error('Inbound resume not found.');
    }

    return await prisma.inboundResume.delete({
      where: { id: inboundId },
    });
  }
}
