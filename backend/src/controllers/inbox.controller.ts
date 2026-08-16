import { Request, Response } from 'express';
import { InboxService } from '../services/inbox.service';

// POST /api/public/inbox/:companySlug - Public ingestion webhook / dropzone for resumes
export const ingestPublicResume = async (req: Request, res: Response) => {
  try {
    const companySlug = req.params.companySlug as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Please attach a resume file (PDF, DOCX, TXT).' });
    }

    const senderEmail = req.body.senderEmail || req.body.from || req.body.email || 'applicant@unknown.com';
    const senderName = req.body.senderName || req.body.name || undefined;
    const subject = req.body.subject || 'Inbound Resume Submission';
    const source = req.body.source || 'email_inbox';

    const inbound = await InboxService.ingest({
      companySlug,
      senderEmail,
      senderName,
      subject,
      source,
      file,
    });

    res.status(201).json({
      success: true,
      message: 'Resume received and parsed into Resume Inbox.',
      data: inbound,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/inbox - List inbound resumes for authenticated recruiter's company
export const listInboundResumes = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const list = await InboxService.list(req.companyId!, status);
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/inbox/:id/convert - Convert inbound resume to candidate & assign job
export const convertInboundResume = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const jobId = req.body.jobId as string | undefined;

    const result = await InboxService.convertToCandidate(req.companyId!, id, jobId);
    res.json({
      success: true,
      message: 'Candidate created and application linked successfully!',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/inbox/:id - Delete / Archive an inbound resume
export const deleteInboundResume = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await InboxService.delete(req.companyId!, id);
    res.json({ success: true, message: 'Inbound resume deleted.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
