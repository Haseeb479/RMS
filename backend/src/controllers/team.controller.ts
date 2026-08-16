import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

/* ─── Members ─────────────────────────────────────────────────── */
export const listMembers = async (req: Request, res: Response) => {
  try {
    const members = await TeamService.listMembers(req.companyId!);
    res.json({ success: true, data: members });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, error: 'Role is required' });
    const member = await TeamService.updateRole(req.params.userId as string, req.companyId!, role);
    res.json({ success: true, data: member });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    await TeamService.removeMember(req.params.userId as string, req.companyId!);
    res.json({ success: true, message: 'Team member removed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ─── Invites ─────────────────────────────────────────────────── */
export const listInvites = async (req: Request, res: Response) => {
  try {
    const invites = await TeamService.listInvites(req.companyId!);
    res.json({ success: true, data: invites });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendInvite = async (req: Request, res: Response) => {
  try {
    const { email, name, role, invitedBy } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    const invite = await TeamService.sendInvite(req.companyId!, { email, name, role, invitedBy });
    res.status(201).json({ success: true, data: invite });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const cancelInvite = async (req: Request, res: Response) => {
  try {
    await TeamService.cancelInvite(req.params.inviteId as string, req.companyId!);
    res.json({ success: true, message: 'Invite cancelled' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/* ─── Tasks ───────────────────────────────────────────────────── */
export const listTasks = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      assignedEmail: typeof req.query.assignedEmail === 'string' ? req.query.assignedEmail : undefined,
      priority: typeof req.query.priority === 'string' ? req.query.priority : undefined,
    };
    const tasks = await TeamService.listTasks(req.companyId!, filters);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    if (!req.body.title) return res.status(400).json({ success: false, error: 'Task title is required' });
    const task = await TeamService.createTask(req.companyId!, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await TeamService.updateTask(req.params.taskId as string, req.companyId!, req.body);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await TeamService.deleteTask(req.params.taskId as string, req.companyId!);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const stats = await TeamService.getTaskStats(req.companyId!);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
