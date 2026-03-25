import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model';
import { Observable } from 'rxjs';
import { TaskPriority, TaskStatus } from '../enum';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  position: number;
  boardId: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly API = environment.apiUrl + '/tasks';

  getOne(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API}/${id}`);
  }

  getByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API}/user/${userId}`);
  }

  getByBoard(boardId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API}/board/${boardId}`);
  }

  assignToUser(taskId: number, userId: number): Observable<Task> {
    return this.http.post<Task>(`${this.API}/${taskId}/assign/${userId}`, {});
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API, dto);
  }

  update(id: number, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<Task>(`${this.API}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
