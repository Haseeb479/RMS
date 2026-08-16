import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listInboundResumes,
  convertInboundResume,
  deleteInboundResume,
} from '../controllers/inbox.controller';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listInboundResumes);
router.post('/:id/convert', convertInboundResume);
router.delete('/:id', deleteInboundResume);

export default router;
