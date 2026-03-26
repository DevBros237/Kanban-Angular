import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.css'],
})
export class LogoutDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly dialogRef   = inject(MatDialogRef<LogoutDialogComponent>);

  logout(): void {
    this.dialogRef.close(true);
  }
}
