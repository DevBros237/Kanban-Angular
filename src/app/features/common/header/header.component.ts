// src/app/core/layout/header/header.component.ts
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface Breadcrumb { label: string; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatButtonModule,
    MatBadgeModule, MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly router      = inject(Router);
  private readonly authService = inject(AuthService);

  get user() { return this.authService.currentUser; }

  initials() {
    const name = this.user?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  breadcrumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.router.url))
    ),
    { initialValue: this.buildBreadcrumbs(this.router.url) }
  );

  private buildBreadcrumbs(url: string): Breadcrumb[] {
    const labels: Record<string, string> = {
      '':          'Accueil',
      'dashboard': 'Dashboard',
      'boards':    'Boards',
      'profile':   'Profil',
      'admin':     'Admin',
    };
    const segments = url.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [{ label: 'TaskFlow' }];
    segments.forEach(seg => {
      const label = labels[seg] ?? (seg.length === 36 ? 'Board' : seg);
      crumbs.push({ label });
    });
    return crumbs;
  }
}
