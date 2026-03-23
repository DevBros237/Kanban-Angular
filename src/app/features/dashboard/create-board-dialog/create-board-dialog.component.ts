import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-board-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Nouveau board</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom du board</mat-label>
          <input matInput formControlName="title" placeholder="Ex: Sprint #3" />
          @if (form.get('title')?.hasError('required')) {
            <mat-error>Nom requis</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (optionnelle)</mat-label>
          <textarea matInput formControlName="description" rows="3"
            placeholder="De quoi s'agit-il ?"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary"
        [disabled]="form.invalid"
        (click)="confirm()">
        Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } mat-dialog-content { min-width: 380px; }`],
})
export class CreateBoardDialogComponent {
  private readonly fb  = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<CreateBoardDialogComponent>);

  form = this.fb.group({
    title:       ['', Validators.required],
    description: [''],
  });

  confirm(): void {
    this.ref.close(this.form.getRawValue());
  }
}
