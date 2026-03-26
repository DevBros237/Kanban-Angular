import { Component, inject, OnInit, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

interface StatSnapshot {
  boards: number;
  total:  number;
  done:   number;
  rate:   number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatMenuModule, MatProgressBarModule,
    MatTooltipModule, MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private readonly authService   = inject(AuthService);
  private readonly boardsService = inject(BoardsService);
  private readonly taskService   = inject(TaskService);
  private readonly dialog        = inject(MatDialog);
  private readonly router        = inject(Router);
  private readonly snackBar      = inject(MatSnackBar);
  private readonly platformId    = inject(PLATFORM_ID);
  private readonly STATS_KEY     = 'dashboard_stats_snapshot';

  boards        = signal<Board[]>([]);
  statTasks     = signal<Task[]>([]);
  boardTasks    = signal<Task[]>([]);
  loading       = signal(true);
  previousStats = signal<StatSnapshot | null>(null);

  totalTasks     = computed(() => this.statTasks().length);
  doneTasks      = computed(() => this.statTasks().filter(t => t.status === 'done').length);
  completionRate = computed(() => {
    const total = this.totalTasks();
    if (!total) return 0;
    return Math.round((this.doneTasks() / total) * 100);
  });

  trend = computed(() => {
    const prev = this.previousStats();
    if (!prev) return null;
    return {
      boards: this.boards().length - prev.boards,
      total:  this.totalTasks()    - prev.total,
      done:   this.doneTasks()     - prev.done,
      rate:   this.completionRate() - prev.rate,
    };
  });

  get user() { return this.authService.currentUser; }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const raw = localStorage.getItem(this.STATS_KEY);
      if (raw) this.previousStats.set(JSON.parse(raw));
    }

    forkJoin({
      boardMembers: this.boardsService.getByUser(Number(this.user!.id)),
      tasks:  this.taskService.getByUser(Number(this.user!.id)),
    }).subscribe({
      next: ({ boardMembers, tasks }) => {
        var boards: Board[] = [];
        boardMembers.forEach(element => {
          boards.push(element.board);
        });
        this.boards.set(boards);
        this.statTasks.set(tasks);
        this.boardTasks.set(tasks);
        this.loading.set(false);
        if (isPlatformBrowser(this.platformId)) {
          const done = tasks.filter(t => t.status === 'done').length;
          localStorage.setItem(this.STATS_KEY, JSON.stringify({
            boards: boards.length,
            total:  tasks.length,
            done,
            rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
          }));
        }
      },
      error: () => this.loading.set(false),
    });
  }

  trendIcon(delta: number): string {
    return delta > 0 ? 'trending_up' : delta < 0 ? 'trending_down' : 'trending_flat';
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

  goToBoard(id: number): void {
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
    const boardTasks = this.boardTasks().filter(t => t.board.id === board.id);
    if (!boardTasks.length) return 0;
    const done = boardTasks.filter(t => t.status === 'done').length;
    return Math.round((done / boardTasks.length) * 100);
  }

  logout(): void {
    this.authService.logout();
  }
}
