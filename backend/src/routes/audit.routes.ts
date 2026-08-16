import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { getAuditLogs } from '../controllers/audit.controller';

const router = express.Router();

router.use(authMiddleware);
router.get('/', authorizeRoles('admin', 'recruiter'), getAuditLogs);

export default router;
