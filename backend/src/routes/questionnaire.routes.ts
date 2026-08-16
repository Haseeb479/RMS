import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import {
  getJobQuestions,
  addJobQuestion,
  deleteJobQuestion,
} from '../controllers/questionnaire.controller';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/jobs/:jobId/questions', getJobQuestions);
router.post('/jobs/:jobId/questions', authorizeRoles('admin', 'recruiter'), addJobQuestion);
router.delete('/jobs/:jobId/questions/:questionId', authorizeRoles('admin', 'recruiter'), deleteJobQuestion);

export default router;
