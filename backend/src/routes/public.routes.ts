import { Router } from 'express';
import { upload } from '../config/multer';
import {
  getPublicJob,
  getCompanyCareers,
  submitPublicApplication,
} from '../controllers/public.controller';
import {
  getIndeedXmlFeed,
  getZipRecruiterXmlFeed,
  getJobGoogleSchema,
} from '../controllers/feed.controller';
import {
  getPublicOffer,
  respondPublicOffer,
} from '../controllers/offer.controller';
import {
  ingestPublicResume,
} from '../controllers/inbox.controller';
import {
  handlePublicWebhook,
} from '../controllers/mobility.controller';

const router = Router();

// Unauthenticated public routes for candidate portal
router.get('/jobs/:id', getPublicJob);
router.get('/jobs/:id/schema', getJobGoogleSchema);
router.get('/careers/:companySlug', getCompanyCareers);
router.get('/feeds/indeed/:companySlug.xml', getIndeedXmlFeed);
router.get('/feeds/ziprecruiter/:companySlug.xml', getZipRecruiterXmlFeed);
router.post('/apply', upload.single('resume'), submitPublicApplication);

// Inbound Resume Ingestion Webhook / Dropzone (e.g. for email-to-candidate ingestion)
router.post('/inbox/:companySlug', upload.single('resume'), ingestPublicResume);

// Inbound Payroll / HRIS Offboarding Webhook (e.g. Zoho Payroll, Gusto, Deel, ADP)
router.post('/payroll/webhook/:companySlug', handlePublicWebhook);

// Candidate Public Offer Letter Review & Response Routes
router.get('/offers/:token', getPublicOffer);
router.post('/offers/:token/respond', respondPublicOffer);

export default router;

