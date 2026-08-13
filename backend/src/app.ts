import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import { authMiddleware } from './middleware/auth.middleware';
import * as companyController from './services/company.controller';
import candidateRoutes from './routes/candidates.routes';
import resumeRoutes from './routes/resume.routes';


const app = express();

// ✅ Middleware MUST come before routes so req.body is parsed
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/candidates', candidateRoutes);

// Company router
const companyRouter = express.Router();
companyRouter.use(authMiddleware);
companyRouter.get('/profile', companyController.getProfile);
companyRouter.patch('/profile', companyController.updateProfile);
companyRouter.get('/stats', companyController.getStats);
app.use('/api/resumes', resumeRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRouter);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

export default app;