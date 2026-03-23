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

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.task ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <div class="row-fields">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Statut</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s.value) {
                <mat-option [value]="s.value">{{ s.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Priorité</mat-label>
            <mat-select formControlName="priority">
              @for (p of priorities; track p.value) {
                <mat-option [value]="p.value">{{ p.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (data.task) {
        <button mat-button color="warn" (click)="delete()">Supprimer</button>
      }
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data.task ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width  { width: 100%; }
    .row-fields  { display: flex; gap: 12px; }
    .half-width  { flex: 1; }
    mat-dialog-content { min-width: 400px; }
  `],
})
export class TaskDialogComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly http   = inject(HttpClient);
  private readonly ref    = inject(MatDialogRef<TaskDialogComponent>);
  readonly data: { task?: Task; boardId: string } = inject(MAT_DIALOG_DATA);
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
    status:      [this.data.task?.status      ?? TaskStatus.TODO],
    priority:    [this.data.task?.priority    ?? TaskPriority.MEDIUM],
  });

  save(): void {
    const payload = this.form.getRawValue();
    const req$ = this.data.task
      ? this.http.patch(`${this.API}/tasks/${this.data.task.id}`, payload)
      : this.http.post(`${this.API}/boards/${this.data.boardId}/tasks`, payload);

    req$.subscribe(() => this.ref.close(true));
  }

  delete(): void {
    this.http.delete(`${this.API}/tasks/${this.data.task!.id}`)
      .subscribe(() => this.ref.close(true));
  }
}
