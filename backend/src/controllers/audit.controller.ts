import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditService.getLogs(req.companyId!, 100);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
