import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
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
      tap(res => this.handleAuth(res.access_token))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => this.handleAuth(res.access_token))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap(user => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  private handleAuth(token: string): void {
    localStorage.setItem('access_token', token);
    // on récupère le profil complet juste après
    this.fetchMe().subscribe();
  }

  private getUserFromStorage(): User | null {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }
}
