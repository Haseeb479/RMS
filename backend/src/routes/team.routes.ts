import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listMembers, updateMemberRole, removeMember,
  listInvites, sendInvite, cancelInvite,
  listTasks, createTask, updateTask, deleteTask, getTaskStats,
} from '../controllers/team.controller';

const router = express.Router();
router.use(authMiddleware);

// Members
router.get('/members', listMembers);
router.patch('/members/:userId/role', updateMemberRole);
router.delete('/members/:userId', removeMember);

// Invites
router.get('/invites', listInvites);
router.post('/invites', sendInvite);
router.delete('/invites/:inviteId', cancelInvite);

// Tasks
router.get('/tasks', listTasks);
router.post('/tasks', createTask);
router.get('/tasks/stats', getTaskStats);
router.patch('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

export default router;
