import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listEvents,
  promoteSuccessor,
  createJobFromVacancy,
  dismissEvent,
  listEmployees,
  createEmployee,
  seedEmployees,
  simulateDeparture,
} from '../controllers/mobility.controller';

const router = express.Router();
router.use(authMiddleware);

// Departure / Vacancy events
router.get('/events', listEvents);
router.post('/events/:id/promote', promoteSuccessor);
router.post('/events/:id/create-job', createJobFromVacancy);
router.post('/events/:id/dismiss', dismissEvent);

// Employee Directory
router.get('/employees', listEmployees);
router.post('/employees', createEmployee);
router.post('/seed-employees', seedEmployees);

// Simulator
router.post('/simulate-departure', simulateDeparture);

export default router;
