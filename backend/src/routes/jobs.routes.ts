import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  getJobStats,
} from '../controllers/jobs.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', getJobStats);       // GET  /api/jobs/stats
router.get('/', listJobs);               // GET  /api/jobs?status=published
router.post('/', createJob);             // POST /api/jobs
router.get('/:id', getJob);              // GET  /api/jobs/:id
router.patch('/:id', updateJob);         // PATCH /api/jobs/:id
router.delete('/:id', deleteJob);        // DELETE /api/jobs/:id
router.post('/:id/publish', publishJob); // POST /api/jobs/:id/publish
router.post('/:id/close', closeJob);     // POST /api/jobs/:id/close

export default router;
