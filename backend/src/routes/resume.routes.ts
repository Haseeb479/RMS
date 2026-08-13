import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../config/multer';
import * as controller from '../controllers/resume.controller';

const router = express.Router();

router.use(authMiddleware);

// ⚠️ IMPORTANT: specific routes must come BEFORE parameterized /:id routes
// otherwise Express matches /candidate/xyz as /:id with id = "candidate"

// Get resumes by candidate (must be before /:id)
router.get('/candidate/:candidateId', controller.getByCandidate);

// Upload resume
router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('resume')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  controller.upload
);

// Download resume (must be before /:id to avoid conflict)
router.get('/:id/download', controller.download);

// Get resume by ID
router.get('/:id', controller.getById);

// Delete resume
router.delete('/:id', controller.delete_);

export default router;