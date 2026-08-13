import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';

// POST /api/applications
export const create = async (req: Request, res: Response) => {
  try {
    const application = await ApplicationService.create(req.companyId!, req.body);
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/applications
export const list = async (req: Request, res: Response) => {
  try {
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const applications = await ApplicationService.listByCompany(req.companyId!, {
      jobId,
      status,
      search,
    });
    res.json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/applications/:id
export const getById = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id as string;
    const application = await ApplicationService.getById(req.companyId!, applicationId);
    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// PATCH /api/applications/:id/status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id as string;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const application = await ApplicationService.updateStatus(req.companyId!, applicationId, status);
    res.json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE /api/applications/:id
export const delete_ = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id as string;
    await ApplicationService.delete(req.companyId!, applicationId);
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
