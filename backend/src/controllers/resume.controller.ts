import { Request, Response } from 'express';
import { ResumeService } from '../services/resume.service';

export const upload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Extract text from file
    const extractedText = await ResumeService.extractTextFromFile(req.file);

    // Parse resume data
    const parsedData = ResumeService.parseResumeData(extractedText);

    // Create resume record
    const candidateId = req.body.candidateId || null;
    const resume = await ResumeService.create(
      req.companyId!,
      candidateId,
      req.file,
      extractedText
    );

    res.status(201).json({
      success: true,
      data: {
        resume,
        parsedData,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const resumeId = req.params.id as string;
    const resume = await ResumeService.getById(resumeId, req.companyId!);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: resume });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getByCandidate = async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;
    const resumes = await ResumeService.getByCandidate(candidateId, req.companyId!);
    res.json({ success: true, data: resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const delete_ = async (req: Request, res: Response) => {
  try {
    const resumeId = req.params.id as string;
    await ResumeService.delete(resumeId, req.companyId!);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const download = async (req: Request, res: Response) => {
  try {
    const resumeId = req.params.id as string;
    const resume = await ResumeService.getById(resumeId, req.companyId!);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    res.download(resume.filePath, resume.fileName);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};