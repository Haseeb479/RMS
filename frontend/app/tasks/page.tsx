'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTeam, TaskItem } from '@/lib/hooks/useteam';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/topnav';

const STATUSES = ['todo', 'in_progress', 'done', 'cancelled'] as const;
type TaskStatus = typeof STATUSES[number];

const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string; badge: string }> = {
  todo: { label: 'To Do', color: '#1473E6', bg: '#EEF4FF', badge: 'zr-badge zr-badge-blue' },
  in_progress: { label: 'In Progress', color: '#E8652A', bg: '#FFF4EE', badge: 'zr-badge zr-badge-orange' },
  done: { label: 'Completed', color: '#27AE60', bg: '#EDFBF4', badge: 'zr-badge zr-badge-green' },
  cancelled: { label: 'Cancelled', color: '#718096', bg: '#F7FAFC', badge: 'zr-badge zr-badge-gray' },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: '#E53E3E', bg: '#FFF0F0' },
  high: { label: 'High', color: '#DD6B20', bg: '#FFFAF0' },
  medium: { label: 'Medium', color: '#3182CE', bg: '#EBF8FF' },
  low: { label: 'Low', color: '#718096', bg: '#F7FAFC' },
};

export default function TasksPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const {
    tasks,
    members,
    loading,
    error,
    fetchTasks,
    fetchMembers,
    createTask,
    updateTask,
    deleteTask,
  } = useTeam();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedEmail: '',
    assignedTo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) router.push('/auth/login');
  }, [isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (isLoggedIn) {
      fetchTasks({
        status: statusFilter || undefined,
        assignedEmail: assigneeFilter || undefined,
        priority: priorityFilter || undefined,
      });
      fetchMembers();
    }
  }, [isLoggedIn, statusFilter, assigneeFilter, priorityFilter, fetchTasks, fetchMembers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusToggle = async (task: TaskItem) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!taskForm.title.trim()) {
      setModalError('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const selectedMember = members.find((m) => m.email === taskForm.assignedEmail);
      await createTask({
        ...taskForm,
        assignedTo: selectedMember?.name || selectedMember?.email || taskForm.assignedEmail || undefined,
        createdBy: 'Recruiter',
      });
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedEmail: '',
        assignedTo: '',
      });
    } catch (err: any) {
      setModalError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId: string, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    try {
      await deleteTask(taskId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  if (!isLoggedIn) return null;

  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled' && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zr-bg)', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div className="zr-page" style={{ flex: 1 }}>
        <TopNav />

        {/* Subheader */}
        <div className="zr-subheader">
          <div>
            <h1 className="zr-subheader-title">Tasks &amp; Collaboration</h1>
            <p style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2 }}>
              Coordinate recruitment actions, interview prep, candidate follow-ups, and hiring tasks
            </p>
          </div>
          <button
            onClick={() => {
              setModalError('');
              setShowCreateModal(true);
            }}
            className="zr-btn zr-btn-orange zr-btn-sm"
          >
            + Create Task
          </button>
        </div>

        <div className="zr-content" style={{ maxWidth: 1100 }}>
          {/* Stat summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'All Tasks', value: totalCount, color: 'var(--zr-text)', border: 'var(--zr-border)' },
              { label: 'To Do', value: todoCount, color: '#1473E6', border: '#1473E622' },
              { label: 'In Progress', value: inProgressCount, color: '#E8652A', border: '#E8652A22' },
              { label: 'Overdue', value: overdueCount, color: '#E53E3E', border: '#E53E3E22' },
              { label: 'Completed', value: doneCount, color: '#27AE60', border: '#27AE6022' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'var(--zr-white)',
                  border: `1px solid ${s.border}`,
                  borderRadius: 'var(--zr-radius-lg)',
                  padding: '14px 16px',
                  boxShadow: 'var(--zr-shadow-sm)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--zr-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '10px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          {/* Filter Bar */}
          <div className="zr-card" style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              <button
                onClick={() => setStatusFilter('')}
                className={statusFilter === '' ? 'zr-btn zr-btn-blue zr-btn-xs' : 'zr-btn zr-btn-ghost zr-btn-xs'}
              >
                All Statuses
              </button>
              {STATUSES.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={statusFilter === st ? 'zr-btn zr-btn-blue zr-btn-xs' : 'zr-btn zr-btn-ghost zr-btn-xs'}
                >
                  {STATUS_META[st].label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="zr-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              >
                <option value="">All Assignees</option>
                {members.map((m) => (
                  <option key={m.id} value={m.email}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="zr-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Tasks Table / Card List */}
          <div className="zr-card" style={{ overflow: 'hidden' }}>
            {loading && tasks.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--zr-muted)', fontSize: 13 }}>
                Loading recruitment tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="zr-empty" style={{ border: 'none', padding: '48px 24px' }}>
                <div className="zr-empty-icon">📋</div>
                <div className="zr-empty-title">No Tasks Found</div>
                <div className="zr-empty-desc">
                  Create collaboration tasks to track follow-ups, interview preps, candidate approvals, and team to-dos.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="zr-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>Done</th>
                      <th>Task Title &amp; Details</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const isDone = task.status === 'done';
                      const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                      const sMeta = STATUS_META[task.status as TaskStatus] || STATUS_META.todo;
                      const isOverdue = !isDone && task.status !== 'cancelled' && task.dueDate && new Date(task.dueDate) < new Date();

                      return (
                        <tr key={task.id} style={{ opacity: isDone ? 0.7 : 1 }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleStatusToggle(task)}
                              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--zr-success)' }}
                            />
                          </td>
                          <td>
                            <div style={{ textDecoration: isDone ? 'line-through' : 'none', fontWeight: 600, fontSize: 13, color: 'var(--zr-text)' }}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div style={{ fontSize: 12, color: 'var(--zr-muted)', marginTop: 2, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: pMeta.color,
                                background: pMeta.bg,
                                padding: '2px 8px',
                                borderRadius: 12,
                                border: `1px solid ${pMeta.color}33`,
                              }}
                            >
                              {pMeta.label}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--zr-text-2)' }}>
                              {task.assignedTo || task.assignedEmail || <span style={{ color: 'var(--zr-muted-light)' }}>Unassigned</span>}
                            </div>
                          </td>
                          <td>
                            {task.dueDate ? (
                              <div style={{ fontSize: 12, color: isOverdue ? 'var(--zr-danger)' : 'var(--zr-text-2)', fontWeight: isOverdue ? 700 : 400 }}>
                                {isOverdue ? '⚠ ' : ''}{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--zr-muted-light)' }}>No date</span>
                            )}
                          </td>
                          <td>
                            <select
                              value={task.status}
                              onChange={(e) => updateTask(task.id, { status: e.target.value })}
                              className={sMeta.badge}
                              style={{ border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', background: 'inherit', color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit', padding: 'inherit', borderRadius: 'inherit' }}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {STATUS_META[st].label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDelete(task.id, task.title)}
                              className="zr-btn zr-btn-danger-ghost zr-btn-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div className="zr-card" style={{ width: '100%', maxWidth: 520, padding: 24, boxShadow: 'var(--zr-shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--zr-text)', margin: 0 }}>
                  Create Recruitment Task
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--zr-muted)' }}
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div style={{ background: 'var(--zr-danger-light)', border: '1px solid var(--zr-danger)', color: 'var(--zr-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 12, marginBottom: 14 }}>
                  ⚠ {modalError}
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label className="zr-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Review portfolio for Frontend Lead candidate"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="zr-label">Description / Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details or notes for the assignee..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="zr-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="zr-label">Assign To</label>
                    <select
                      value={taskForm.assignedEmail}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedEmail: e.target.value })}
                      className="zr-input"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.email}>
                          {m.name ? `${m.name} (${m.role})` : m.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="zr-label">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="zr-input"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="zr-label">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="zr-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="zr-btn zr-btn-ghost zr-btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="zr-btn zr-btn-orange zr-btn-sm"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
