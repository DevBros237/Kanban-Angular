import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { TaskPriority, TaskStatus } from '../../core/enum';
import { TaskService } from '../../core/services/task.service';

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
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly http   = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly taskService = inject(TaskService);
  private readonly cdr    = inject(ChangeDetectorRef);
  private readonly API    = environment.apiUrl;

  boardId    = '';
  boardTitle = 'Mon Board';

  readonly priorityLabels: Record<string, string> = {
    low:    'Basse',
    medium: 'Moyenne',
    high:   'Haute',
    // [TaskPriority.LOW]:    'Basse',
    // [TaskPriority.MEDIUM]: 'Moyenne',
    // [TaskPriority.HIGH]:   'Haute',
  };

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
    console.log("task");

    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getByBoard(Number(this.boardId))
      .subscribe(tasks => {
        this.columns.forEach(col => {
          col.tasks = tasks
            .filter(t => t.status === col.status)
            .sort((a, b) => a.position - b.position);
        });
        this.cdr.markForCheck();
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

      this.taskService.update(Number(task.id), { status, position })
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
}
