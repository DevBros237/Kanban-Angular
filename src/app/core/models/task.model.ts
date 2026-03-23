import { TaskStatus, TaskPriority } from '../enum';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  boardId: string;
  assignee?: { id: string; name: string };
  dueDate?: string;
}
