import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import candidateRoutes from './routes/candidates.routes';
import resumeRoutes from './routes/resume.routes';
import applicationRoutes from './routes/applications.routes';
import interviewRoutes from './routes/interviews.routes';
import publicRoutes from './routes/public.routes';
import questionnaireRoutes from './routes/questionnaire.routes';
import auditRoutes from './routes/audit.routes';
import offerRoutes from './routes/offer.routes';
import workflowRoutes from './routes/workflow.routes';
import booleanSearchRoutes from './routes/booleanSearch.routes';
import inboxRoutes from './routes/inbox.routes';
import teamRoutes from './routes/team.routes';
import mobilityRoutes from './routes/mobility.routes';
import atsRoutes from './routes/ats.routes';
import notificationRoutes from './routes/notification.routes';
import { authMiddleware } from './middleware/auth.middleware';
import * as companyController from './services/company.controller';

const app = express();

// ─── Global Middleware (MUST come before routes) ───────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, health checks, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured FRONTEND_URL
    if (process.env.FRONTEND_URL && (origin === process.env.FRONTEND_URL || origin === process.env.FRONTEND_URL.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    // Allow localhost and any Vercel domain (*.vercel.app)
    if (origin.includes('localhost') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Fallback: allow
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Company Router ────────────────────────────────────────────────────────────
const companyRouter = express.Router();
companyRouter.use(authMiddleware);
companyRouter.get('/profile', companyController.getProfile);
companyRouter.patch('/profile', companyController.updateProfile);
companyRouter.get('/stats', companyController.getStats);
companyRouter.get('/analytics', companyController.getAnalytics);

// ─── API Routes Router ────────────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

apiRouter.use('/public', publicRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/jobs', questionnaireRoutes);
apiRouter.use('/candidates', candidateRoutes);
apiRouter.use('/resumes', resumeRoutes);
apiRouter.use('/resumes', booleanSearchRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/interviews', interviewRoutes);
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/offers', offerRoutes);
apiRouter.use('/workflows', workflowRoutes);
apiRouter.use('/inbox', inboxRoutes);
apiRouter.use('/team', teamRoutes);
apiRouter.use('/mobility', mobilityRoutes);
apiRouter.use('/ats', atsRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/company', companyRouter);

// Mount API router at both /api and root /
app.use('/api', apiRouter);
app.use('/', apiRouter);

// ─── Root Endpoint ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'RMS Backend API is live and operational!', timestamp: new Date().toISOString() });
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