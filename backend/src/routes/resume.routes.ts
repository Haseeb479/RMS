import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../config/multer';
import * as controller from '../controllers/resume.controller';

const router = express.Router();

router.use(authMiddleware);

// Upload resume
router.post('/', upload.single('resume'), controller.upload);

// Get resume by ID
router.get('/:id', controller.getById);

// Get resumes by candidate
router.get('/candidate/:candidateId', controller.getByCandidate);

// Download resume
router.get('/:id/download', controller.download);

// Delete resume
router.delete('/:id', controller.delete_);

export default router;