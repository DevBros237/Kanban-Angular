import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { BoardsService } from '../../core/services/board.service';
import { Board } from '../../core/models/board.model';
import { CreateBoardDialogComponent } from './create-board-dialog/create-board-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatMenuModule, MatProgressBarModule,
    MatTooltipModule, MatSnackBarModule,
  ],
  template: `
    <div class="dashboard">

      <!-- Navbar -->
      <header class="navbar">
        <span class="brand">TaskFlow</span>
        <div class="nav-right">
          <span class="username">{{ user?.name }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon> Se déconnecter
            </button>
          </mat-menu>
        </div>
      </header>

      <main class="main-content">

        <!-- Stats bar -->
        <section class="stats-bar">
          <div class="stat-card">
            <span class="stat-value">{{ boards().length }}</span>
            <span class="stat-label">Boards</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ totalTasks() }}</span>
            <span class="stat-label">Tâches totales</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ doneTasks() }}</span>
            <span class="stat-label">Terminées</span>
          </div>
          <div class="stat-card accent">
            <span class="stat-value">{{ completionRate() }}%</span>
            <span class="stat-label">Complétion</span>
          </div>
        </section>

        <!-- Boards header -->
        <div class="section-header">
          <h2>Mes boards</h2>
          <button mat-flat-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon> Nouveau board
          </button>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" />
        }

        <!-- Empty state -->
        @if (!loading() && boards().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">dashboard</mat-icon>
            <p>Aucun board pour l'instant</p>
            <button mat-flat-button color="primary" (click)="openCreateDialog()">
              Créer mon premier board
            </button>
          </div>
        }

        <!-- Boards grid -->
        <div class="boards-grid">
          @for (board of boards(); track board.id) {
            <mat-card class="board-card" (click)="goToBoard(board.id)">
              <mat-card-header>
                <mat-card-title>{{ board.title }}</mat-card-title>
                <span class="spacer"></span>
                <button mat-icon-button
                  (click)="$event.stopPropagation()"
                  [matMenuTriggerFor]="boardMenu"
                  [matMenuTriggerData]="{ board: board }">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </mat-card-header>

              @if (board.description) {
                <mat-card-content>
                  <p class="board-desc">{{ board.description }}</p>
                </mat-card-content>
              }

              <mat-card-footer class="board-footer">
                <span class="board-date">
                  Créé le {{ board.createdAt | date:'dd/MM/yyyy' }}
                </span>
                <div class="board-progress">
                  <mat-progress-bar
                    mode="determinate"
                    [value]="boardCompletion(board)"
                    color="primary"
                  />
                </div>
              </mat-card-footer>
            </mat-card>
          }
        </div>

      </main>
    </div>

    <!-- Board context menu -->
    <mat-menu #boardMenu="matMenu">
      <ng-template matMenuContent let-board="board">
        <button mat-menu-item (click)="deleteBoard(board)">
          <mat-icon color="warn">delete</mat-icon>
          <span>Supprimer</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .dashboard      { min-height: 100vh; background: #f5f5f5; }

    /* Navbar */
    .navbar         { display: flex; align-items: center; justify-content: space-between;
                      padding: 0 24px; height: 60px; background: #fff;
                      box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .brand          { font-size: 18px; font-weight: 500; color: #5c35d6; }
    .nav-right      { display: flex; align-items: center; gap: 8px; }
    .username       { font-size: 14px; color: #616161; }

    /* Main */
    .main-content   { padding: 24px; max-width: 1200px; margin: 0 auto; }

    /* Stats */
    .stats-bar      { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .stat-card      { flex: 1; min-width: 140px; background: #fff; border-radius: 12px;
                      padding: 20px; text-align: center;
                      box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .stat-card.accent { background: #5c35d6; }
    .stat-card.accent .stat-value,
    .stat-card.accent .stat-label { color: #fff; }
    .stat-value     { display: block; font-size: 28px; font-weight: 500; color: #212121; }
    .stat-label     { display: block; font-size: 12px; color: #9e9e9e; margin-top: 4px; }

    /* Section header */
    .section-header { display: flex; justify-content: space-between;
                      align-items: center; margin-bottom: 16px; }
    .section-header h2 { margin: 0; font-size: 18px; font-weight: 500; }

    /* Boards grid */
    .boards-grid    { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                      gap: 16px; }
    .board-card     { cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
                      border-radius: 12px !important; }
    .board-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important; }
    .board-desc     { font-size: 13px; color: #757575; margin: 0;
                      display: -webkit-box; -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical; overflow: hidden; }
    .board-footer   { padding: 8px 16px 12px; }
    .board-date     { font-size: 11px; color: #bdbdbd; display: block; margin-bottom: 6px; }
    .board-progress mat-progress-bar { border-radius: 4px; }
    .spacer         { flex: 1; }

    /* Empty state */
    .empty-state    { text-align: center; padding: 64px 24px; }
    .empty-icon     { font-size: 64px; width: 64px; height: 64px; color: #e0e0e0;
                      display: block; margin: 0 auto 16px; }
    .empty-state p  { color: #9e9e9e; margin-bottom: 16px; }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly authService   = inject(AuthService);
  private readonly boardsService = inject(BoardsService);
  private readonly dialog        = inject(MatDialog);
  private readonly router        = inject(Router);
  private readonly snackBar      = inject(MatSnackBar);

  boards  = signal<Board[]>([]);
  loading = signal(true);

  // stats calculées depuis les boards
  // (en production, ces données viendraient de l'API /boards/:id/stats)
  totalTasks     = computed(() => this.boards().length * 5);   // placeholder
  doneTasks      = computed(() => this.boards().length * 2);   // placeholder
  completionRate = computed(() => {
    const total = this.totalTasks();
    if (!total) return 0;
    return Math.round((this.doneTasks() / total) * 100);
  });

  get user() { return this.authService.currentUser; }

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.loading.set(true);
    this.boardsService.getAll().subscribe({
      next:  boards => { this.boards.set(boards); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateBoardDialogComponent, { width: '440px' });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      this.boardsService.create(result).subscribe({
        next: board => {
          this.boards.update(list => [board, ...list]);
          this.snackBar.open('Board créé !', 'Fermer', { duration: 3000 });
        },
      });
    });
  }

  goToBoard(id: string): void {
    this.router.navigate(['/boards', id]);
  }

  deleteBoard(board: Board): void {
    this.boardsService.delete(board.id).subscribe({
      next: () => {
        this.boards.update(list => list.filter(b => b.id !== board.id));
        this.snackBar.open('Board supprimé', 'Fermer', { duration: 3000 });
      },
    });
  }

  boardCompletion(board: Board): number {
    // à brancher sur les vraies stats quand l'endpoint /stats est prêt
    return Math.floor(Math.random() * 100);
  }

  logout(): void {
    this.authService.logout();
  }
}
