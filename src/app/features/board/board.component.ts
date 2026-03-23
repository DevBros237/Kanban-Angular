import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  CdkDragDrop, DragDropModule,
  moveItemInArray, transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { Task} from '../../core/models/task.model';
import { environment } from '../../../environments/environment';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { TaskStatus } from '../../core/enum';

interface KanbanColumn {
  status: TaskStatus;
  label:  string;
  color:  string;
  tasks:  Task[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, DragDropModule,
    MatCardModule, MatButtonModule,
    MatIconModule, MatDialogModule, MatChipsModule,
  ],
  template: `
    <div class="board-wrapper">
      <header class="board-header">
        <h1>{{ boardTitle }}</h1>
        <button mat-flat-button color="primary" (click)="openTaskDialog()">
          <mat-icon>add</mat-icon> Nouvelle tâche
        </button>
      </header>

      <div class="kanban-board">
        @for (col of columns; track col.status) {
          <div class="kanban-column">
            <div class="col-header" [style.border-color]="col.color">
              <span class="col-title">{{ col.label }}</span>
              <span class="col-count">{{ col.tasks.length }}</span>
            </div>

            <div
              class="task-list"
              cdkDropList
              [id]="col.status"
              [cdkDropListData]="col.tasks"
              [cdkDropListConnectedTo]="connectedLists"
              (cdkDropListDropped)="onDrop($event)"
            >
              @for (task of col.tasks; track task.id) {
                <mat-card
                  class="task-card"
                  cdkDrag
                  (click)="openTaskDialog(task)"
                >
                  <mat-card-content>
                    <p class="task-title">{{ task.title }}</p>

                    @if (task.description) {
                      <p class="task-desc">{{ task.description }}</p>
                    }

                    <div class="task-meta">
                      <mat-chip
                        class="priority-chip"
                        [style.background]="priorityColor(task.priority)"
                      >
                        {{ task.priority }}
                      </mat-chip>

                      @if (task.assignee) {
                        <span class="assignee">{{ task.assignee.name }}</span>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              @if (col.tasks.length === 0) {
                <div class="empty-col">Aucune tâche</div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .board-wrapper  { padding: 24px; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
    .board-header   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .board-header h1 { margin: 0; font-size: 22px; font-weight: 500; }

    .kanban-board   { display: flex; gap: 16px; flex: 1; overflow-x: auto; }
    .kanban-column  { min-width: 300px; flex: 1; display: flex; flex-direction: column; background: #f5f5f5; border-radius: 8px; padding: 12px; }

    .col-header     { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 3px solid; }
    .col-title      { font-weight: 500; font-size: 14px; }
    .col-count      { background: #e0e0e0; border-radius: 12px; padding: 2px 8px; font-size: 12px; }

    .task-list      { flex: 1; min-height: 80px; }
    .task-card      { margin-bottom: 8px; cursor: grab; transition: box-shadow 0.2s; }
    .task-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .task-card.cdk-drag-dragging { cursor: grabbing; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) { transition: transform 250ms; }

    .task-title  { font-weight: 500; margin: 0 0 4px; font-size: 14px; }
    .task-desc   { font-size: 12px; color: #757575; margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-meta   { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .assignee    { font-size: 11px; color: #9e9e9e; }
    .priority-chip { font-size: 11px !important; min-height: 20px !important; padding: 0 8px !important; color: white !important; }
    .empty-col   { text-align: center; color: #bdbdbd; font-size: 13px; padding: 24px 0; }
  `],
})
export class BoardComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly http   = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly API    = environment.apiUrl;

  boardId    = '';
  boardTitle = 'Mon Board';

  columns: KanbanColumn[] = [
    { status: TaskStatus.TODO,        label: 'À faire',     color: '#9e9e9e', tasks: [] },
    { status: TaskStatus.IN_PROGRESS, label: 'En cours',    color: '#1976d2', tasks: [] },
    { status: TaskStatus.DONE,        label: 'Terminé',     color: '#388e3c', tasks: [] },
  ];

  get connectedLists() {
    return this.columns.map(c => c.status);
  }

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id')!;
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<Task[]>(`${this.API}/boards/${this.boardId}/tasks`)
      .subscribe(tasks => {
        this.columns.forEach(col => {
          col.tasks = tasks
            .filter(t => t.status === col.status)
            .sort((a, b) => a.position - b.position);
        });
      });
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const task    = event.container.data[event.currentIndex];
      const status  = event.container.id as TaskStatus;
      const position = event.currentIndex;

      this.http.patch(`${this.API}/tasks/${task.id}`, { status, position })
        .subscribe();
    }
  }

  openTaskDialog(task?: Task): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      width: '480px',
      data: { task, boardId: this.boardId },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  priorityColor(priority: string): string {
    return { low: '#66bb6a', medium: '#ffa726', high: '#ef5350' }[priority] ?? '#9e9e9e';
  }
}
