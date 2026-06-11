export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface TasksResponse {
  success: true;
  count: number;
  tasks: Task[];
}

export interface TaskResponse {
  success: true;
  message: string;
  task: Task;
}
