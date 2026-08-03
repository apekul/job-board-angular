import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CompaniesService } from '../services/companies.service';
import { CompanyDetail } from '../models/company.model';

export const companyResolver: ResolveFn<CompanyDetail | null> = (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) return of(null);
  return inject(CompaniesService)
    .getCompany(slug)
    .pipe(catchError(() => of(null)));
};
