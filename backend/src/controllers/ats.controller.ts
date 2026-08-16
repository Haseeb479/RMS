import { Request, Response } from 'express';
import { AtsService } from '../services/ats.service';

export const scoreInboundResume = async (req: Request, res: Response) => {
  try {
    const { resumeId, jobId } = req.body;
    if (!resumeId) return res.status(400).json({ success: false, error: 'resumeId is required' });

    const result = await AtsService.scoreInboundResume(resumeId, req.companyId!, jobId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const batchScoreInbox = async (req: Request, res: Response) => {
  try {
    const result = await AtsService.batchScoreInboundResumes(req.companyId!);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const scoreCandidate = async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    if (!candidateId) return res.status(400).json({ success: false, error: 'candidateId is required' });

    const result = await AtsService.scoreCandidate(candidateId, req.companyId!, jobId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateEmail = async (req: Request, res: Response) => {
  try {
    const draft = await AtsService.generateEmail(req.companyId!, req.body);
    res.json({ success: true, data: draft });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendEmail = async (req: Request, res: Response) => {
  try {
    const result = await AtsService.confirmAndSendEmail(req.companyId!, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
