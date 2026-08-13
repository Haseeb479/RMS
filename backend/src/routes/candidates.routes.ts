import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  create,
  list,
  getById,
  update,
  delete_ as deleteCandidate,
  getStats,
} from '../controllers/candidates.controller';

const router = express.Router();
router.use(authMiddleware);
router.get('/', list);
router.post('/', create);
router.get('/stats', getStats);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', deleteCandidate);

export default router;