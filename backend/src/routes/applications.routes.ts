import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  create,
  list,
  getById,
  updateStatus,
  delete_ as deleteApplication,
} from '../controllers/applications.controller';

const router = express.Router();
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteApplication);

export default router;
