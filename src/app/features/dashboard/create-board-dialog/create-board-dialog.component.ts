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
  templateUrl: './create-board-dialog.component.html',
  styleUrls: [`./create-board-dialog.component.css`],
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
