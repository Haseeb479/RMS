import { Router } from 'express';
import { upload } from '../config/multer';
import {
  getPublicJob,
  getCompanyCareers,
  submitPublicApplication,
} from '../controllers/public.controller';

const router = Router();

// Unauthenticated public routes for candidate portal
router.get('/jobs/:id', getPublicJob);
router.get('/careers/:companySlug', getCompanyCareers);
router.post('/apply', upload.single('resume'), submitPublicApplication);

export default router;
