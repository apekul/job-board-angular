import { Component, computed, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { JobsService } from '../../../core/services/jobs.service';
import { Job, JobsQueryParams } from '../../../core/models/job.model';
import { JobCardComponent } from '../../../shared/job-card/job-card.component';
import { SearchBarComponent } from '../../../shared/search-bar/search-bar.component';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [JobCardComponent, SearchBarComponent, FiltersComponent],
  templateUrl: './jobs-list.component.html',
})
export class JobsListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jobsService = inject(JobsService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private queryParams = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  currentFilters = signal<JobsQueryParams>({});

  activeFiltersCount = computed(() => {
    const f = this.currentFilters();
    let count = 0;
    if (f.search) count++;
    if (f.location) count++;
    if (f.workMode !== undefined) count++;
    if (f.salaryMin !== undefined) count++;
    if (f.salaryMax !== undefined) count++;
    if (f.technologies?.length) count++;
    if (f.level?.length) count++;
    if (f.sort && f.sort !== 'newest') count++;
    return count;
  });

  constructor() {
    effect(() => {
      const raw = this.queryParams();
      const params = this.deserializeParams(raw);
      this.currentFilters.set(params);
      this.loading.set(true);
      this.error.set(null);
      this.jobsService.getJobs(params).subscribe({
        next: (jobs) => {
          this.jobs.set(jobs);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load jobs. Please try again.');
          this.loading.set(false);
        },
      });
    });
  }

  updateParams(patch: Partial<JobsQueryParams>) {
    const merged = Object.keys(patch).length === 0 ? {} : { ...this.currentFilters(), ...patch };
    const serialized = this.serializeParams(merged);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: serialized,
      queryParamsHandling: 'replace',
    });
  }

  private deserializeParams(raw: import('@angular/router').ParamMap): JobsQueryParams {
    const params: JobsQueryParams = {};

    const search = raw.get('search');
    if (search) params.search = search;

    const location = raw.get('location');
    if (location) params.location = location;

    const workMode = raw.get('workMode') as JobsQueryParams['workMode'];
    if (workMode) params.workMode = workMode;

    const salaryMin = raw.get('salaryMin');
    if (salaryMin) params.salaryMin = Number(salaryMin);

    const salaryMax = raw.get('salaryMax');
    if (salaryMax) params.salaryMax = Number(salaryMax);

    const technologies = raw.getAll('technologies');
    if (technologies.length) params.technologies = technologies;

    const level = raw.getAll('level') as ('junior' | 'mid' | 'senior')[];
    if (level.length) params.level = level;

    const sort = raw.get('sort') as JobsQueryParams['sort'];
    if (sort) params.sort = sort;

    return params;
  }

  private serializeParams(params: JobsQueryParams): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    if (params.search) result['search'] = params.search;
    if (params.location) result['location'] = params.location;
    if (params.workMode) result['workMode'] = params.workMode;
    if (params.salaryMin !== undefined) result['salaryMin'] = String(params.salaryMin);
    if (params.salaryMax !== undefined) result['salaryMax'] = String(params.salaryMax);
    if (params.technologies?.length) result['technologies'] = params.technologies;
    if (params.level?.length) result['level'] = params.level;
    if (params.sort) result['sort'] = params.sort;
    return result;
  }
}
