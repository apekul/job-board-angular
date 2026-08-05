import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { JobAlert, JobAlertFilters } from '../models/alert.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  getAlerts(): Observable<JobAlert[]> {
    return this.http
      .get<{ data: JobAlert[] }>(`${this.apiUrl}/alerts`)
      .pipe(map((res) => res.data));
  }

  create(name: string, filters: JobAlertFilters): Observable<JobAlert> {
    return this.http
      .post<{ data: JobAlert }>(`${this.apiUrl}/alerts`, { name, filters })
      .pipe(map((res) => res.data));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alerts/${id}`);
  }
}
