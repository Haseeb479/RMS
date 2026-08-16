import { Request, Response } from 'express';
import { BooleanSearchService } from '../services/booleanSearch.service';

export const searchResumesBoolean = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string || '';
    const result = await BooleanSearchService.searchResumes(req.companyId!, q);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
