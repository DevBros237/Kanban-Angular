import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Task} from '../../../core/models/task.model';
import { environment } from '../../../../environments/environment';
import { TaskPriority, TaskStatus } from '../../../core/enum';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TaskService, CreateTaskDto } from '../../../core/services/task.service';
@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css'],
})
export class TaskDialogComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly http   = inject(HttpClient);
  private readonly ref    = inject(MatDialogRef<TaskDialogComponent>);
  private readonly taskService = inject(TaskService);
  readonly data: { task?: Task; boardId: number; defaultStatus?: TaskStatus } = inject(MAT_DIALOG_DATA);
  private readonly API    = environment.apiUrl;

  statuses   = [
    { value: TaskStatus.TODO,        label: 'À faire' },
    { value: TaskStatus.IN_PROGRESS, label: 'En cours' },
    { value: TaskStatus.DONE,        label: 'Terminé' },
  ];
  priorities = [
    { value: TaskPriority.LOW,    label: 'Basse' },
    { value: TaskPriority.MEDIUM, label: 'Moyenne' },
    { value: TaskPriority.HIGH,   label: 'Haute' },
  ];

  form = this.fb.group({
    title:       [this.data.task?.title       ?? '', Validators.required],
    description: [this.data.task?.description ?? ''],
    status:      [this.data.task?.status      ?? this.data.defaultStatus ?? TaskStatus.TODO],
    priority:    [this.data.task?.priority    ?? TaskPriority.MEDIUM],
    dueDate:     [this.data.task?.dueDate     ? new Date(this.data.task.dueDate) : null],
    position:    [this.data.task?.position    ?? 0],
    boardId:     [this.data.boardId],
  });

  save(): void {
    const formValue = this.form.getRawValue();
    const payload : CreateTaskDto = {
      title: formValue.title!,
      description: formValue.description!,
      status: formValue.status!,
      priority: formValue.priority!,
      dueDate: formValue?.dueDate!,
      position: formValue.position!,
      boardId: formValue.boardId!,
    };
    const req$ = this.data.task
      ? this.taskService.update(Number(this.data.task.id), payload)
      : this.taskService.create(payload);

    req$.subscribe(() => this.ref.close(true));
  }

  delete(): void {
    this.taskService.delete(Number(this.data.task!.id))
      .subscribe(() => this.ref.close(true));
  }
}
