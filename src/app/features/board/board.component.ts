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
        <div class="board-title-group">
          <h1 class="board-title">{{ boardTitle }}</h1>
          <span class="board-count">{{ totalTasks }} tâche{{ totalTasks !== 1 ? 's' : '' }}</span>
        </div>
        <button class="add-btn" (click)="openTaskDialog()">
          <mat-icon>add</mat-icon> Nouvelle tâche
        </button>
      </header>

      <div class="kanban-board">
        @for (col of columns; track col.status) {
          <div class="kanban-column">
            <div class="col-header">
              <div class="col-header-left">
                <span class="col-dot" [style.background]="col.color"></span>
                <span class="col-title">{{ col.label }}</span>
              </div>
              <span class="col-badge">{{ col.tasks.length }}</span>
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
                  <div class="priority-bar priority-{{task.priority}}"></div>
                  <mat-card-content>
                    <div class="card-top">
                      <p class="task-title">{{ task.title }}</p>
                      <span class="drag-handle" cdkDragHandle>
                        <mat-icon>drag_indicator</mat-icon>
                      </span>
                    </div>
                    @if (task.description) {
                      <p class="task-desc">{{ task.description }}</p>
                    }
                    <div class="task-meta">
                      <span class="priority-badge priority-badge-{{task.priority}}">
                        {{ task.priority }}
                      </span>
                      @if (task.assignee) {
                        <div class="assignee-chip">
                          <span class="assignee-avatar">{{ task.assignee.name?.[0] ?? '?' }}</span>
                          <span>{{ task.assignee.name }}</span>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              @if (col.tasks.length === 0) {
                <div class="empty-col">
                  <mat-icon>inbox</mat-icon>
                  <span>Aucune tâche</span>
                </div>
              }
            </div>

            <button class="col-add-btn" (click)="openTaskDialog(undefined, col.status)">
              <mat-icon>add</mat-icon> Ajouter
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .board-wrapper { padding: 28px 24px 0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; background: #f8f8f8; box-sizing: border-box; }

    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-shrink: 0; }
    .board-title-group { display: flex; align-items: baseline; gap: 10px; }
    .board-title { margin: 0; font-size: 22px; font-weight: 700; color: #111; letter-spacing: -0.5px; }
    .board-count { font-size: 13px; color: #999; font-weight: 500; }
    .add-btn { display: inline-flex; align-items: center; gap: 4px; background: #111; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 40px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
    .add-btn:hover { opacity: 0.8; }

    .kanban-board { display: flex; gap: 14px; flex: 1; overflow-x: auto; padding-bottom: 24px; }
    .kanban-column { min-width: 290px; flex: 1; display: flex; flex-direction: column; background: white; border-radius: 12px; border: 1px solid #e8e8e8; overflow: hidden; max-height: calc(100vh - 130px); }

    .col-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #111; flex-shrink: 0; }
    .col-header-left { display: flex; align-items: center; gap: 8px; }
    .col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .col-title { font-weight: 600; font-size: 12px; color: white; text-transform: uppercase; letter-spacing: 0.6px; }
    .col-badge { background: rgba(255,255,255,0.15); color: white; border-radius: 20px; padding: 2px 9px; font-size: 12px; font-weight: 600; }

    .task-list { flex: 1; min-height: 80px; padding: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; transition: background 0.2s; }
    .cdk-drop-list-dragging { background: #f2f2f2; }

    .task-card { margin: 0 !important; cursor: pointer; border-radius: 10px !important; border: 1px solid #ebebeb !important; box-shadow: none !important; position: relative; overflow: hidden; transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
    .task-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.09) !important; border-color: #ccc !important; }
    .task-card.cdk-drag-dragging { cursor: grabbing; box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important; transform: rotate(1.5deg) scale(1.02); }
    .cdk-drag-placeholder { background: #f4f4f4; border: 2px dashed #ddd !important; border-radius: 10px; min-height: 72px; box-shadow: none !important; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(.4,0,.2,1); }
    .cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) { transition: transform 250ms; }

    .priority-bar { position: absolute; top: 0; left: 0; bottom: 0; width: 4px; }
    .priority-high { background: #111; }
    .priority-medium { background: #888; }
    .priority-low { background: #d4d4d4; }

    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .task-title { font-weight: 600; margin: 0 0 4px 8px; font-size: 13.5px; color: #111; line-height: 1.4; flex: 1; }
    .drag-handle { color: #ccc; cursor: grab; opacity: 0; transition: opacity 0.15s; flex-shrink: 0; padding: 2px; display: flex; }
    .task-card:hover .drag-handle { opacity: 1; }
    .task-desc { font-size: 12px; color: #888; margin: 0 0 10px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-left: 8px; }

    .priority-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600; text-transform: capitalize; }
    .priority-badge-high { background: #111; color: white; }
    .priority-badge-medium { background: #555; color: white; }
    .priority-badge-low { background: #e8e8e8; color: #555; }

    .assignee-chip { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #666; }
    .assignee-avatar { width: 20px; height: 20px; background: #333; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }

    .empty-col { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #ccc; font-size: 13px; padding: 32px 0; }
    .empty-col mat-icon { font-size: 28px; width: 28px; height: 28px; color: #ddd; }

    .col-add-btn { display: flex; align-items: center; gap: 4px; width: 100%; border: none; background: none; padding: 11px 16px; font-size: 13px; color: #999; cursor: pointer; border-top: 1px solid #eee; transition: background 0.15s, color 0.15s; font-family: inherit; flex-shrink: 0; }
    .col-add-btn:hover { background: #fafafa; color: #111; }
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

  get totalTasks() {
    return this.columns.reduce((sum, col) => sum + col.tasks.length, 0);
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

  openTaskDialog(task?: Task, defaultStatus?: TaskStatus): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      width: '480px',
      data: { task, boardId: this.boardId, defaultStatus },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  priorityColor(priority: string): string {
    return { low: '#66bb6a', medium: '#ffa726', high: '#ef5350' }[priority] ?? '#9e9e9e';
  }
}
