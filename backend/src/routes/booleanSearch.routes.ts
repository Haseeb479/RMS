import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { searchResumesBoolean } from '../controllers/booleanSearch.controller';

const router = express.Router();

router.use(authMiddleware);
router.get('/search', searchResumesBoolean);

export default router;
