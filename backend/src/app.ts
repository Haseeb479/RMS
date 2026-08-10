import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';
import * as companyController from './services/company.controller';

const app = express();
const companyRouter = express.Router();

companyRouter.use(authMiddleware);
companyRouter.get('/profile', companyController.getProfile);
companyRouter.patch('/profile', companyController.updateProfile);
companyRouter.get('/stats', companyController.getStats);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRouter);

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