import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  create,
  list,
  getById,
  update,
  delete_ as deleteCandidate,
  getStats,
  getNotes,
  addNote,
  deleteNote,
  checkDuplicate,
} from '../controllers/candidates.controller';

const router = express.Router();
router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.get('/stats', getStats);
router.get('/check-duplicate', checkDuplicate);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', deleteCandidate);

// Activity Notes
router.get('/:id/notes', getNotes);
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

export default router;