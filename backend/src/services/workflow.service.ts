import { prisma } from '../config/database';
import { AuditService } from './audit.service';

export class WorkflowService {
  static async listRules(companyId: string) {
    return await prisma.workflowRule.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async createOrUpdateRule(companyId: string, data: any) {
    if (!data.stage || !data.action) {
      throw new Error('Stage and Action are required.');
    }

    const existing = await prisma.workflowRule.findFirst({
      where: { companyId, stage: data.stage },
    });

    let rule;
    if (existing) {
      rule = await prisma.workflowRule.update({
        where: { id: existing.id },
        data: {
          action: data.action,
          templateSubject: data.templateSubject || null,
          templateBody: data.templateBody || null,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        },
      });
    } else {
      rule = await prisma.workflowRule.create({
        data: {
          companyId,
          stage: data.stage,
          action: data.action,
          templateSubject: data.templateSubject || null,
          templateBody: data.templateBody || null,
          isActive: true,
        },
      });
    }

    await AuditService.log(
      companyId,
      'WORKFLOW_RULE_UPDATED',
      `Updated automated trigger rule for hiring stage "${data.stage}"`
    );

    return rule;
  }

  static async triggerStageWorkflow(companyId: string, candidateId: string, newStage: string) {
    try {
      const rule = await prisma.workflowRule.findFirst({
        where: { companyId, stage: newStage, isActive: true },
      });

      if (!rule) return;

      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, companyId },
      });

      if (!candidate) return;

      // Execute automated action log
      await AuditService.log(
        companyId,
        'AUTOMATED_WORKFLOW_TRIGGERED',
        `Automated Action [${rule.action}] executed for candidate ${candidate.firstName} ${candidate.lastName} on entering stage "${newStage}". Subject: "${rule.templateSubject || 'N/A'}"`
      );

      return { triggered: true, rule };
    } catch (err) {
      console.error('Workflow trigger error:', err);
    }
  }
}
