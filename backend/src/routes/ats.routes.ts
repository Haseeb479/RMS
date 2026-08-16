import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  scoreInboundResume,
  batchScoreInbox,
  scoreCandidate,
  generateEmail,
  sendEmail,
} from '../controllers/ats.controller';

const router = Router();

router.use(authMiddleware);

router.post('/score-resume', scoreInboundResume);
router.post('/batch-score-inbox', batchScoreInbox);
router.post('/score-candidate', scoreCandidate);
router.post('/generate-email', generateEmail);
router.post('/send-email', sendEmail);

export default router;
