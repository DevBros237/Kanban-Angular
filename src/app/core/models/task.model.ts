import { TaskStatus, TaskPriority } from '../enum';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  board: {
    title: string;
    description: string;
    id: number;
  };
  assignee: {
    email: string;
    password: string;
    name: string;
    // role: 'USER';
    id: number;
  };
  dueDate?: Date;
}
