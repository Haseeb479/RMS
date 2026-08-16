import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ResumeService } from '../services/resume.service';
import { AuditService } from '../services/audit.service';
import { AtsService } from '../services/ats.service';
import { NotificationService } from '../services/notification.service';

// GET /api/public/jobs/:id - Get published job details (public access)
export const getPublicJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const isNum = !isNaN(Number(id));
    const numId = isNum ? parseInt(id, 10) : -1;

    const job = await prisma.job.findFirst({
      where: {
        status: 'published',
        OR: [
          { id },
          ...(isNum ? [{ jobCode: numId }] : []),
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
            description: true,
            logo: true,
          },
        },
        questions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job opening not found or no longer active.' });
    }

    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/public/careers/:companySlug - Get company public career page
export const getCompanyCareers = async (req: Request, res: Response) => {
  try {
    const companySlug = req.params.companySlug as string;

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      include: {
        jobs: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            jobCode: true,
            title: true,
            description: true,
            location: true,
            type: true,
            salary: true,
            requirements: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company career portal not found.' });
    }

    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/public/apply - Candidate public job application & CV upload
export const submitPublicApplication = async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      location,
      experience,
      skills,
      notes,
      privacyConsent,
      answers: rawAnswers,
    } = req.body;

    if (!jobId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Job ID, First Name, Last Name, and Email are required.',
      });
    }

    const consentGiven = privacyConsent === true || privacyConsent === 'true';
    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        error: 'Data Privacy Consent is required to submit your job application.',
      });
    }

    // Verify job exists and is published
    const job = await prisma.job.findFirst({
      where: { id: jobId, status: 'published' },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job posting is not active or available for applications.',
      });
    }

    const companyId = job.companyId;
    const expNum = experience !== undefined ? parseInt(experience) : undefined;
    const skillsStr = typeof skills === 'string' ? skills : Array.isArray(skills) ? JSON.stringify(skills) : undefined;

    // Check if candidate exists for company by email
    let candidate = await prisma.candidate.findFirst({
      where: { email: email.trim().toLowerCase(), companyId },
    });

    if (candidate) {
      // Update existing candidate info
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : candidate.phone,
          location: location ? location.trim() : candidate.location,
          experience: !isNaN(Number(expNum)) ? Number(expNum) : candidate.experience,
          skills: skillsStr || candidate.skills,
          notes: notes ? (candidate.notes ? `${candidate.notes}\n[Public Apply]: ${notes}` : notes) : candidate.notes,
        },
      });
    } else {
      // Create new candidate
      candidate = await prisma.candidate.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          location: location ? location.trim() : null,
          experience: !isNaN(Number(expNum)) ? Number(expNum) : null,
          skills: skillsStr || null,
          notes: notes ? `[Public Candidate Application]: ${notes}` : null,
          status: 'new',
          companyId,
        },
      });
    }

    // Process file upload if provided
    let resumeRecord = null;
    let inboundRecord = null;
    if (req.file) {
      const extractedText = await ResumeService.extractTextFromFile(req.file);
      resumeRecord = await ResumeService.create(companyId, candidate.id, req.file, extractedText);

      // Update candidate resume path
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { resume: req.file.path },
      });

      // ─── Auto-save to Resume Inbox ───────────────────────────────────────
      try {
        const parsedSkillsJson = skillsStr || null;

        inboundRecord = await (prisma as any).inboundResume.create({
          data: {
            companyId,
            senderEmail: email.trim().toLowerCase(),
            senderName: `${firstName.trim()} ${lastName.trim()}`,
            subject: `Job Application – ${job.title}`,
            source: 'job_application',
            status: 'pending',
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            extractedText: extractedText || null,
            parsedName: `${firstName.trim()} ${lastName.trim()}`,
            parsedEmail: email.trim().toLowerCase(),
            parsedPhone: phone ? phone.trim() : null,
            parsedSkills: parsedSkillsJson,
            parsedExperience: expNum || null,
            candidateId: candidate.id,
            assignedJobId: job.id,
          },
        });

        // ─── Fire ATS Scoring async (don't block the response) ──────────────
        setImmediate(async () => {
          try {
            const { atsResult } = await AtsService.scoreInboundResume(inboundRecord!.id, companyId, job.id);

            // Notify HR about this new application with its ATS score
            const scoreEmoji = atsResult.atsScore >= 80 ? '⭐' : atsResult.atsScore >= 60 ? '📋' : '⚠️';
            await NotificationService.createNotification(companyId, {
              title: `${scoreEmoji} New Application: ${firstName} ${lastName} (${atsResult.atsScore}% ATS)`,
              message: `Applied for "${job.title}" — ATS score ${atsResult.atsScore}%. ${atsResult.recommendationReason || ''}`,
              type: 'high_ats_match',
              link: '/sourcing/inbox',
              meta: { resumeId: inboundRecord!.id, atsScore: atsResult.atsScore, jobId: job.id, candidateId: candidate.id },
            });
          } catch (err) {
            console.error('[ATS Auto-Score] Failed for application resume:', err);
          }
        });
      } catch (err) {
        console.error('[Inbox Ingest] Failed to save to resume inbox:', err);
      }
    }

    // Check existing application
    let application = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
    });

    if (!application) {
      application = await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          status: 'applied',
          privacyConsent: true,
        },
      });
    }

    // Save Screening Questionnaire Answers if provided
    let answersObj: Record<string, string> = {};
    if (rawAnswers) {
      try {
        answersObj = typeof rawAnswers === 'string' ? JSON.parse(rawAnswers) : rawAnswers;
      } catch (err) {
        answersObj = {};
      }
    }

    if (Object.keys(answersObj).length > 0) {
      await Promise.all(
        Object.entries(answersObj).map(async ([questionId, answerVal]) => {
          if (answerVal !== undefined && answerVal !== null) {
            await prisma.candidateAnswer.create({
              data: {
                applicationId: application!.id,
                questionId,
                answer: String(answerVal),
              },
            });
          }
        })
      );
    }

    // Record Audit Log
    await AuditService.log(
      companyId,
      'APPLICATION_SUBMITTED',
      `Candidate ${candidate.firstName} ${candidate.lastName} (${candidate.email}) applied for ${job.title}`,
      undefined,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: {
        applicationId: application.id,
        candidateId: candidate.id,
        jobTitle: job.title,
        status: application.status,
        resumeUploaded: !!resumeRecord,
        inboxSaved: !!inboundRecord,
        atsScoring: !!inboundRecord ? 'in_progress' : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
