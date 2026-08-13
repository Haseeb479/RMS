import { Request, Response } from 'express';
import { JobService } from '../services/job.service';

// POST /api/jobs
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.create(req.companyId!, req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/jobs
export const listJobs = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const jobs = await JobService.listByCompany(req.companyId!, status);
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/jobs/stats
export const getJobStats = async (req: Request, res: Response) => {
  try {
    const stats = await JobService.getStats(req.companyId!);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/jobs/:id
export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.getById(req.companyId!, req.params.id as string);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// PATCH /api/jobs/:id
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.update(req.companyId!, req.params.id as string, req.body);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/jobs/:id/publish
export const publishJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.publish(req.companyId!, req.params.id as string);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// POST /api/jobs/:id/close
export const closeJob = async (req: Request, res: Response) => {
  try {
    const job = await JobService.close(req.companyId!, req.params.id as string);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/jobs/:id
export const deleteJob = async (req: Request, res: Response) => {
  try {
    await JobService.delete(req.companyId!, req.params.id as string);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
