import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  create,
  list,
  getById,
  update,
  addFeedback,
  updateStatus,
  delete_ as deleteInterview,
} from '../controllers/interviews.controller';

const router = express.Router();
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.patch('/:id', update);             // Reschedule / update interview details
router.post('/:id/feedback', addFeedback);
router.patch('/:id/status', updateStatus); // Change status (cancelled, completed, etc.)
router.delete('/:id', deleteInterview);

export default router;
