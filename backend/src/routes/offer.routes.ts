import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { createOffer, listOffers } from '../controllers/offer.controller';

const router = express.Router();

router.use(authMiddleware);
router.get('/', listOffers);
router.post('/', authorizeRoles('admin', 'recruiter'), createOffer);

export default router;
