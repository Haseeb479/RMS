import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service';

export const listWorkflowRules = async (req: Request, res: Response) => {
  try {
    const rules = await WorkflowService.listRules(req.companyId!);
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveWorkflowRule = async (req: Request, res: Response) => {
  try {
    const rule = await WorkflowService.createOrUpdateRule(req.companyId!, req.body);
    res.json({ success: true, data: rule, message: 'Workflow rule saved successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
