import { Request, Response } from 'express';
import { MobilityService } from '../services/mobility.service';
import { prisma } from '../config/database';

/* ─── Public Payroll Webhook Ingest ─── */
export const handlePublicWebhook = async (req: Request, res: Response) => {
  try {
    const { companySlug } = req.params;
    const event = await MobilityService.handleDepartureWebhook(companySlug as string, req.body);
    res.status(201).json({
      success: true,
      message: 'Departure event processed & succession candidates evaluated',
      data: event,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ─── Vacancy & Departure Events ─── */
export const listEvents = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const events = await MobilityService.listEvents(req.companyId!, status);
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const promoteSuccessor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, newSalary } = req.body;
    if (!employeeId) return res.status(400).json({ success: false, error: 'employeeId is required' });

    const result = await MobilityService.promoteEmployee(req.companyId!, id as string, employeeId, newSalary);
    res.json({
      success: true,
      message: 'Employee promoted successfully. Cascading vacancy backfill created.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createJobFromVacancy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await MobilityService.createJobRequisitionFromVacancy(req.companyId!, id as string, req.body);
    res.status(201).json({
      success: true,
      message: 'Job requisition draft created successfully',
      data: job,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const dismissEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).payrollDepartureEvent.update({
      where: { id },
      data: { status: 'dismissed' },
    });
    res.json({ success: true, message: 'Vacancy event dismissed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ─── Employees Directory ─── */
export const listEmployees = async (req: Request, res: Response) => {
  try {
    const filters = {
      department: typeof req.query.department === 'string' ? req.query.department : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
    };
    const employees = await MobilityService.listEmployees(req.companyId!, filters);
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await MobilityService.createEmployee(req.companyId!, req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const seedEmployees = async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await MobilityService.seedSampleEmployees(req.companyId!, force);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ─── Simulator ─── */
export const simulateDeparture = async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.companyId! } });
    if (!company) return res.status(404).json({ success: false, error: 'Company not found' });

    const event = await MobilityService.handleDepartureWebhook(company.slug, {
      ...req.body,
      source: req.body.source || 'simulator_test',
    });

    res.status(201).json({
      success: true,
      message: 'Simulated departure event created & AI succession match generated',
      data: event,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
