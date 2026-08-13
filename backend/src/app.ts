import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import candidateRoutes from './routes/candidates.routes';
import resumeRoutes from './routes/resume.routes';
import applicationRoutes from './routes/applications.routes';
import interviewRoutes from './routes/interviews.routes';
import { authMiddleware } from './middleware/auth.middleware';
import * as companyController from './services/company.controller';

const app = express();

// ─── Global Middleware (MUST come before routes) ───────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Company Router ────────────────────────────────────────────────────────────
const companyRouter = express.Router();
companyRouter.use(authMiddleware);
companyRouter.get('/profile', companyController.getProfile);
companyRouter.patch('/profile', companyController.updateProfile);
companyRouter.get('/stats', companyController.getStats);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/company', companyRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

export default app;