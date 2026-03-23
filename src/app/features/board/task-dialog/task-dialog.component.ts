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
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule,MatIcon,
  ],
  template: `
    <div class="dialog-header">
      <div class="dialog-title-group">
        <span class="dialog-icon"><mat-icon>{{ data.task ? 'edit' : 'add_task' }}</mat-icon></span>
        <h2 class="dialog-title">{{ data.task ? 'Modifier la tâche' : 'Nouvelle tâche' }}</h2>
      </div>
      <button class="close-btn" mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre</mat-label>
          <input matInput formControlName="title" placeholder="Nom de la tâche..." />
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Le titre est requis</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Décrivez la tâche..."></textarea>
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

    <mat-dialog-actions>
      @if (data.task) {
        <button class="delete-btn" mat-button (click)="delete()">
          <mat-icon>delete_outline</mat-icon> Supprimer
        </button>
      }
      <div class="actions-right">
        <button mat-button class="cancel-btn" mat-dialog-close>Annuler</button>
        <button class="save-btn" (click)="save()" [disabled]="form.invalid">
          <mat-icon>{{ data.task ? 'check' : 'add' }}</mat-icon>
          {{ data.task ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 12px; border-bottom: 1px solid #f0f0f0; }
    .dialog-title-group { display: flex; align-items: center; gap: 10px; }
    .dialog-icon { width: 36px; height: 36px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
    .dialog-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .dialog-title { margin: 0; font-size: 17px; font-weight: 700; color: #111; letter-spacing: -0.3px; }
    .close-btn { color: #aaa !important; transition: color 0.15s; }
    .close-btn:hover { color: #333 !important; }

    mat-dialog-content { min-width: 440px; padding: 16px 20px !important; }
    .full-width { width: 100%; margin-bottom: 4px; }
    .row-fields { display: flex; gap: 12px; }
    .half-width { flex: 1; }

    mat-dialog-actions { padding: 12px 20px 20px !important; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f0f0f0; margin: 0; min-height: unset !important; }
    .actions-right { display: flex; align-items: center; gap: 8px; }
    .delete-btn { color: #aaa !important; font-size: 13px; transition: color 0.15s; }
    .delete-btn:hover { color: #e53935 !important; }
    .cancel-btn { color: #666 !important; font-size: 13px; }
    .save-btn { display: inline-flex; align-items: center; gap: 4px; background: #111; color: white; border: none; border-radius: 8px; padding: 0 16px; height: 38px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
    .save-btn:hover:not(:disabled) { opacity: 0.8; }
    .save-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .save-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class TaskDialogComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly http   = inject(HttpClient);
  private readonly ref    = inject(MatDialogRef<TaskDialogComponent>);
  readonly data: { task?: Task; boardId: string; defaultStatus?: TaskStatus } = inject(MAT_DIALOG_DATA);
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
