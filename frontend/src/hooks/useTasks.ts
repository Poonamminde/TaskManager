import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import type {
  Task,
  TaskStatus,
  CreateTaskPayload,
  UpdateTaskPayload,
  TasksResponse,
  TaskResponse,
} from '../types/task';
import axios from 'axios';

function extractMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: { msg: string }[] };
    return data?.errors?.[0]?.msg ?? data?.message ?? fallback;
  }
  return fallback;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');

  const fetchTasks = useCallback(async (status: TaskStatus | '' = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = status ? { status } : {};
      const { data } = await api.get<TasksResponse>('/tasks', { params });
      setTasks(data.tasks);
    } catch (err) {
      setError(extractMessage(err, 'Failed to load tasks.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks(statusFilter);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const createTask = useCallback(async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await api.post<TaskResponse>('/tasks', payload);
    setTasks((prev) => [data.task, ...prev]);
    return data.task;
  }, []);

  const updateTask = useCallback(async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await api.patch<TaskResponse>(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
    return data.task;
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  return {
    tasks,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
