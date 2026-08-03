import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CompanyDetail, CompanySummary } from '../models/company.model';
import { API_URL } from '../config/api-url.token';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  readonly companies = signal<CompanySummary[]>([]);

  loadCompanies(): void {
    this.http.get<{ data: CompanySummary[] }>(`${this.apiUrl}/companies`).subscribe({
      next: (res) => this.companies.set(res.data),
      error: () => this.companies.set([]),
    });
  }

  getCompany(id: string): Observable<CompanyDetail> {
    return this.http
      .get<{ data: CompanyDetail }>(`${this.apiUrl}/companies/${id}`)
      .pipe(map((res) => res.data));
  }
}
