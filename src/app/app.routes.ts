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
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/common/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'boards/:id',
        loadComponent: () =>
          import('./features/board/board.component').then(m => m.BoardComponent),
      },
      // {
      //   path: 'profile',
      //   loadComponent: () =>
      //     import('./features/profile/profile.component').then(m => m.ProfileComponent),
      // },
      // {
      //   path: 'admin',
      //   canActivate: [roleGuard(UserRole.ADMIN)],
      //   loadComponent: () =>
      //     import('./features/admin/admin.component').then(m => m.AdminComponent),
      // },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
