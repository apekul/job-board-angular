import { Injectable, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'job-board:token';
const USER_KEY = 'job-board:user';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly apiUrl = environment.apiUrl;

  readonly token = signal<string | null>(null);
  readonly user = signal<User | null>(null);

  readonly isAuthenticated = computed(() => this.token() !== null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private restoreSession(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    this.token.set(token);
    try {
      this.user.set(JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null);
    } catch {
      this.user.set(null);
    }

    afterNextRender(() => {
      this.fetchMe().subscribe({ error: () => this.logout() });
    });
  }

  private setSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }

  private fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.user.set(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }),
    );
  }
}
