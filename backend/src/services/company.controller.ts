import { Request, Response } from 'express';
import { CompanyService } from './company.service';
import { AnalyticsService } from './analytics.service';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const company = await CompanyService.getById(req.companyId!);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const company = await CompanyService.update(req.companyId!, req.body);
    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await CompanyService.getStats(req.companyId!);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
    const analytics = await AnalyticsService.getCompanyAnalytics(req.companyId!, jobId);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};