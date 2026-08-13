import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  create,
  list,
  getById,
  addFeedback,
  updateStatus,
  delete_ as deleteInterview,
} from '../controllers/interviews.controller';

const router = express.Router();
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.post('/:id/feedback', addFeedback);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteInterview);

export default router;
