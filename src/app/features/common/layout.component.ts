import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatTooltipModule,
    HeaderComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  isLeftSidebarCollapsed = signal(false);
  user = toSignal(this.authService.currentUser$, { initialValue: null });

  items = [
    { routeLink: '/dashboard', icon: 'dashboard',   label: 'Dashboard' },
    { routeLink: '/boards',    icon: 'view_kanban', label: 'Mes boards' },
    { routeLink: '/profile',   icon: 'person',      label: 'Profil'    },
  ];

  initials(): string {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleCollapse(): void {
    this.isLeftSidebarCollapsed.update(v => !v);
  }

  closeSidenav(): void {
    this.isLeftSidebarCollapsed.set(true);
  }

  logout(): void {
    this.authService.logout();
  }
}
