import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ResumeService } from '../services/resume.service';

// GET /api/public/jobs/:id - Get published job details (public access)
export const getPublicJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.job.findFirst({
      where: {
        id,
        status: 'published',
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
    } = req.body;

    if (!jobId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Job ID, First Name, Last Name, and Email are required.',
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
    if (req.file) {
      const extractedText = await ResumeService.extractTextFromFile(req.file);
      resumeRecord = await ResumeService.create(companyId, candidate.id, req.file, extractedText);

      // Update candidate resume path
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { resume: req.file.path },
      });
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
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: {
        applicationId: application.id,
        candidateId: candidate.id,
        jobTitle: job.title,
        status: application.status,
        resumeUploaded: !!resumeRecord,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
