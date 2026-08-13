import { Request, Response } from 'express';
import { CandidateService } from '../services/candidate.service';

export const create = async (req: Request, res: Response) => {
  try {
    const candidate = await CandidateService.create(req.companyId!, req.body);
    res.status(201).json({ success: true, data: candidate });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 20;

    const result = await CandidateService.list(req.companyId!, {
      status,
      search,
      page,
      limit,
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.id as string;
    const candidate = await CandidateService.getById(candidateId, req.companyId!);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    res.json({ success: true, data: candidate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.id as string;
    const candidate = await CandidateService.update(candidateId, req.companyId!, req.body);
    res.json({ success: true, data: candidate });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const delete_ = async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.id as string;
    await CandidateService.delete(candidateId, req.companyId!);
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await CandidateService.getStats(req.companyId!);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};