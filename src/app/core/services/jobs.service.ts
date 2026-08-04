import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Job, JobPage, JobsQueryParams } from '../models/job.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  readonly technologies = signal<string[]>([]);

  loadTechnologies(): void {
    this.http.get<{ data: string[] }>(`${this.apiUrl}/technologies`).subscribe({
      next: (res) => this.technologies.set(res.data),
      error: () => this.technologies.set([]),
    });
  }

  getJobs(params: JobsQueryParams = {}, cursor?: string | null): Observable<JobPage> {
    let httpParams = new HttpParams().set('limit', '12');
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.location) httpParams = httpParams.set('location', params.location);
    if (params.workMode) httpParams = httpParams.set('workMode', params.workMode);
    if (params.salaryMin !== undefined) httpParams = httpParams.set('salaryMin', params.salaryMin);
    if (params.salaryMax !== undefined) httpParams = httpParams.set('salaryMax', params.salaryMax);
    for (const tech of params.technologies ?? [])
      httpParams = httpParams.append('technologies', tech);
    for (const lvl of params.level ?? []) httpParams = httpParams.append('level', lvl);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (cursor) httpParams = httpParams.set('cursor', cursor);

    return this.http.get<JobPage>(`${this.apiUrl}/jobs`, { params: httpParams });
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/jobs/${id}`);
  }

  getJobsByIds(ids: string[]): Observable<Job[]> {
    return this.http
      .post<{ data: Job[] }>(`${this.apiUrl}/jobs/batch`, { ids })
      .pipe(map((res) => res.data));
  }
}
