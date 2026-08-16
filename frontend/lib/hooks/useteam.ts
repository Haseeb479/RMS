import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | string;
  createdAt: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  name: string | null;
  role: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  assignedTo: string | null;
  assignedEmail: string | null;
  createdBy: string | null;
  candidateId: string | null;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─── Members ─── */
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/team/members');
      setMembers(res.data.data || []);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch team members');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMemberRole = async (userId: string, role: string) => {
    try {
      const res = await api.patch(`/team/members/${userId}/role`, { role });
      setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update role');
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await api.delete(`/team/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to remove member');
    }
  };

  /* ─── Invites ─── */
  const fetchInvites = useCallback(async () => {
    try {
      const res = await api.get('/team/invites');
      setInvites(res.data.data || []);
      return res.data.data;
    } catch (err: any) {
      console.error('Error fetching invites:', err);
      return [];
    }
  }, []);

  const sendInvite = async (data: { email: string; name?: string; role: string; invitedBy?: string }) => {
    try {
      const res = await api.post('/team/invites', data);
      setInvites((prev) => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to send invite');
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      await api.delete(`/team/invites/${inviteId}`);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to cancel invite');
    }
  };

  /* ─── Tasks ─── */
  const fetchTasks = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.assignedEmail) params.append('assignedEmail', filters.assignedEmail);
      if (filters.priority) params.append('priority', filters.priority);

      const res = await api.get(`/team/tasks?${params.toString()}`);
      setTasks(res.data.data || []);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskStats = useCallback(async () => {
    try {
      const res = await api.get('/team/tasks/stats');
      setTaskStats(res.data.data);
      return res.data.data;
    } catch (err: any) {
      console.error('Error fetching task stats:', err);
    }
  }, []);

  const createTask = async (data: any) => {
    try {
      const res = await api.post('/team/tasks', data);
      setTasks((prev) => [res.data.data, ...prev]);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to create task');
    }
  };

  const updateTask = async (taskId: string, data: any) => {
    try {
      const res = await api.patch(`/team/tasks/${taskId}`, data);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data.data : t)));
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/team/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to delete task');
    }
  };

  return {
    members,
    invites,
    tasks,
    taskStats,
    loading,
    error,
    fetchMembers,
    updateMemberRole,
    removeMember,
    fetchInvites,
    sendInvite,
    cancelInvite,
    fetchTasks,
    fetchTaskStats,
    createTask,
    updateTask,
    deleteTask,
  };
}
