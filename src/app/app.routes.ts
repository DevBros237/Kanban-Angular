import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/enum';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  {
    path: 'dashboard',
    //canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
  },

  {
    path: 'boards/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/board/board.component').then(m => m.BoardComponent),
  },

  // {
  //   path: 'admin',
  //   canActivate: [authGuard, roleGuard(UserRole.ADMIN)],
  //   loadComponent: () =>
  //     import('./features/admin/admin.component').then(m => m.AdminComponent),
  // },

  { path: '**', redirectTo: 'dashboard' },
];
