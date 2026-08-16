import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { listWorkflowRules, saveWorkflowRule } from '../controllers/workflow.controller';

const router = express.Router();

router.use(authMiddleware);
router.get('/', listWorkflowRules);
router.post('/', authorizeRoles('admin', 'recruiter'), saveWorkflowRule);

export default router;
