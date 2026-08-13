import { Request, Response } from 'express';
import { InterviewService } from '../services/interview.service';

// POST /api/interviews - Schedule interview
export const create = async (req: Request, res: Response) => {
  try {
    const interview = await InterviewService.create(req.companyId!, req.body);
    res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/interviews - List interviews
export const list = async (req: Request, res: Response) => {
  try {
    const candidateId = typeof req.query.candidateId === 'string' ? req.query.candidateId : undefined;
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const interviews = await InterviewService.listByCompany(req.companyId!, {
      candidateId,
      jobId,
      status,
      search,
    });
    res.json({ success: true, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/interviews/:id - Get interview by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const interview = await InterviewService.getById(req.companyId!, id);
    res.json({ success: true, data: interview });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// PATCH /api/interviews/:id - Update / Reschedule interview
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const interview = await InterviewService.update(req.companyId!, id, req.body);
    res.json({ success: true, data: interview });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/interviews/:id/feedback - Add interview feedback & rating
export const addFeedback = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const interview = await InterviewService.addFeedback(req.companyId!, id, req.body);
    res.json({ success: true, data: interview });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// PATCH /api/interviews/:id/status - Update interview status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const interview = await InterviewService.updateStatus(req.companyId!, id, status);
    res.json({ success: true, data: interview });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/interviews/:id - Delete interview
export const delete_ = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await InterviewService.delete(req.companyId!, id);
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
