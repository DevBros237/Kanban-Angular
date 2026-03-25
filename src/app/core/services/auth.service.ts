import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly API    = environment.apiUrl + '/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  register(payload: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, payload).pipe(
      tap(res => this.writeToStorage('access_token', res.access_token)),
      switchMap(res => this.fetchMe().pipe(map(() => res)))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => this.writeToStorage('access_token', res.access_token)),
      switchMap(res => this.fetchMe().pipe(map(() => res)))
    );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe({
      next: () => {
        // on ignore la réponse, même en cas d'erreur, on veut déconnecter l'utilisateur localement
        this.removeFromStorage('access_token');
        this.removeFromStorage('current_user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        throw new Error('Logout failed');
      }
    });
  }

  getToken(): string | null {
    return this.readFromStorage('access_token');
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap(user => {
        this.writeToStorage('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  private getUserFromStorage(): User | null {
    const raw = this.readFromStorage('current_user');

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      this.removeFromStorage('current_user');
      return null;
    }
  }

  private readFromStorage(key: string): string | null {
    const storage = this.getStorage();
    return storage?.getItem(key) ?? null;
  }

  private writeToStorage(key: string, value: string): void {
    this.getStorage()?.setItem(key, value);
  }

  private removeFromStorage(key: string): void {
    this.getStorage()?.removeItem(key);
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storage = globalThis.localStorage;

    if (
      !storage ||
      typeof storage.getItem !== 'function' ||
      typeof storage.setItem !== 'function' ||
      typeof storage.removeItem !== 'function'
    ) {
      return null;
    }

    return storage;
  }
}
