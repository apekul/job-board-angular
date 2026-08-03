import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Application, ApplicationStatus } from '../models/application.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly apiUrl = environment.apiUrl;

  readonly applications = signal<Application[]>([]);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refresh();
      } else {
        this.applications.set([]);
      }
    });
  }

  refresh(): void {
    this.http.get<{ data: Application[] }>(`${this.apiUrl}/applications`).subscribe({
      next: (res) => this.applications.set(res.data),
      error: () => this.applications.set([]),
    });
  }

  apply(jobId: string): Observable<Application> {
    return this.http.post<{ data: Application }>(`${this.apiUrl}/applications`, { jobId }).pipe(
      tap(() => this.refresh()),
      map((res) => res.data),
    );
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.http
      .patch<{ data: Application }>(`${this.apiUrl}/applications/${id}`, { status })
      .pipe(
        tap(() => this.refresh()),
        map((res) => res.data),
      );
  }
}
