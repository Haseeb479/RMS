import { prisma } from '../config/database';
import crypto from 'crypto';

/* ─────────────────────────── Team Members ─────────────────────────── */
export class TeamService {

  /** List all users in the company */
  static async listMembers(companyId: string) {
    return await prisma.user.findMany({
      where: { companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Update a member's role */
  static async updateRole(userId: string, companyId: string, role: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
    if (!user) throw new Error('Team member not found');
    return await prisma.user.update({ where: { id: userId }, data: { role } });
  }

  /** Remove a member from the company */
  static async removeMember(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, companyId } });
    if (!user) throw new Error('Team member not found');
    return await prisma.user.delete({ where: { id: userId } });
  }

  /* ─────────────── Invites ─────────────── */
  static async listInvites(companyId: string) {
    return await (prisma as any).teamInvite.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async sendInvite(companyId: string, data: { email: string; name?: string; role: string; invitedBy?: string }) {
    // Check if already a member
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.companyId === companyId) throw new Error('This person is already a team member.');

    // Check for pending invite
    const pendingInvite = await (prisma as any).teamInvite.findFirst({
      where: { companyId, email: data.email, status: 'pending' },
    });
    if (pendingInvite) throw new Error('An invite is already pending for this email.');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return await (prisma as any).teamInvite.create({
      data: {
        companyId,
        email: data.email,
        name: data.name || null,
        role: data.role || 'recruiter',
        token,
        status: 'pending',
        invitedBy: data.invitedBy || null,
        expiresAt,
      },
    });
  }

  static async cancelInvite(inviteId: string, companyId: string) {
    const invite = await (prisma as any).teamInvite.findFirst({ where: { id: inviteId, companyId } });
    if (!invite) throw new Error('Invite not found');
    return await (prisma as any).teamInvite.delete({ where: { id: inviteId } });
  }

  /* ─────────────── Tasks ─────────────── */
  static async listTasks(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.status) where.status = filters.status;
    if (filters.assignedEmail) where.assignedEmail = filters.assignedEmail;
    if (filters.priority) where.priority = filters.priority;

    return await (prisma as any).task.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async createTask(companyId: string, data: any) {
    return await (prisma as any).task.create({
      data: {
        companyId,
        title: data.title,
        description: data.description || null,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignedTo: data.assignedTo || null,
        assignedEmail: data.assignedEmail || null,
        createdBy: data.createdBy || null,
        candidateId: data.candidateId || null,
        jobId: data.jobId || null,
      },
    });
  }

  static async updateTask(taskId: string, companyId: string, data: any) {
    const task = await (prisma as any).task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new Error('Task not found');
    return await (prisma as any).task.update({
      where: { id: taskId },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        status: data.status !== undefined ? data.status : undefined,
        priority: data.priority !== undefined ? data.priority : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        assignedTo: data.assignedTo !== undefined ? data.assignedTo : undefined,
        assignedEmail: data.assignedEmail !== undefined ? data.assignedEmail : undefined,
      },
    });
  }

  static async deleteTask(taskId: string, companyId: string) {
    const task = await (prisma as any).task.findFirst({ where: { id: taskId, companyId } });
    if (!task) throw new Error('Task not found');
    return await (prisma as any).task.delete({ where: { id: taskId } });
  }

  static async getTaskStats(companyId: string) {
    const statuses = ['todo', 'in_progress', 'done', 'cancelled'];
    const counts = await Promise.all(
      statuses.map(async s => ({ status: s, count: await (prisma as any).task.count({ where: { companyId, status: s } }) }))
    );
    return {
      total: counts.reduce((a, c) => a + c.count, 0),
      byStatus: Object.fromEntries(counts.map(c => [c.status, c.count])),
    };
  }
}
