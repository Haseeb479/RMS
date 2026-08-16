import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuditService } from '../services/audit.service';

// GET /api/jobs/:jobId/questions - Get questions for a job
export const getJobQuestions = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const questions = await prisma.screeningQuestion.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: questions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/jobs/:jobId/questions - Add screening question to job
export const addJobQuestion = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const { question, type, options, isRequired } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question text is required.' });
    }

    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId: req.companyId! },
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job opening not found.' });
    }

    const newQuestion = await prisma.screeningQuestion.create({
      data: {
        jobId,
        question: question.trim(),
        type: type || 'text',
        options: options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null,
        isRequired: isRequired !== undefined ? Boolean(isRequired) : true,
      },
    });

    await AuditService.log(
      req.companyId!,
      'SCREENING_QUESTION_CREATED',
      `Added question "${question.trim()}" to job ${job.title}`,
      (req as any).user?.id
    );

    res.status(201).json({ success: true, data: newQuestion });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/jobs/:jobId/questions/:questionId - Remove screening question
export const deleteJobQuestion = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const questionId = req.params.questionId as string;

    const question = await prisma.screeningQuestion.findFirst({
      where: { id: questionId, jobId },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found.' });
    }

    await prisma.screeningQuestion.delete({
      where: { id: questionId },
    });

    await AuditService.log(
      req.companyId!,
      'SCREENING_QUESTION_DELETED',
      `Deleted question "${question.question}" from job ${jobId}`,
      (req as any).user?.id
    );

    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
