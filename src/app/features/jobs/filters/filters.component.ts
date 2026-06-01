import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { JobsQueryParams } from '../../../core/models/job.model';
import { ALL_TECHNOLOGIES } from '../../../core/services/jobs.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './filters.component.html',
})
export class FiltersComponent {
  filters = input<JobsQueryParams>({});
  filtersChange = output<JobsQueryParams>();

  readonly allTechnologies = ALL_TECHNOLOGIES;
  readonly levels = ['junior', 'mid', 'senior'] as const;
  readonly sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'salary_asc', label: 'Salary: Low to High' },
    { value: 'salary_desc', label: 'Salary: High to Low' },
  ];

  form = this.fb.group({
    location: [''],
    remote: [undefined as boolean | undefined],
    salaryMin: [undefined as number | undefined],
    salaryMax: [undefined as number | undefined],
    technologies: [[] as string[]],
    level: [[] as string[]],
    sort: ['newest' as string],
  });

  activeCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.location) count++;
    if (f.remote !== undefined) count++;
    if (f.salaryMin !== undefined) count++;
    if (f.salaryMax !== undefined) count++;
    if (f.technologies?.length) count++;
    if (f.level?.length) count++;
    if (f.sort && f.sort !== 'newest') count++;
    return count;
  });

  constructor(private fb: FormBuilder) {
    this.form.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => this.emit());

    effect(() => {
      const f = this.filters();
      this.form.patchValue(
        {
          location: f.location ?? '',
          remote: f.remote,
          salaryMin: f.salaryMin,
          salaryMax: f.salaryMax,
          technologies: f.technologies ?? [],
          level: f.level ?? [],
          sort: f.sort ?? 'newest',
        },
        { emitEvent: false },
      );
    });
  }

  setRemote(value: boolean | undefined) {
    this.form.patchValue({ remote: value });
  }

  toggleTechnology(tech: string) {
    const current = this.form.value.technologies ?? [];
    const next = current.includes(tech)
      ? current.filter((t) => t !== tech)
      : [...current, tech];
    this.form.patchValue({ technologies: next });
  }

  toggleLevel(level: string) {
    const current = this.form.value.level ?? [];
    const next = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    this.form.patchValue({ level: next });
  }

  clearFilters() {
    this.filtersChange.emit({});
  }

  private emit() {
    const v = this.form.value;
    const params: JobsQueryParams = {};
    if (v.location) params.location = v.location;
    if (v.remote !== undefined && v.remote !== null) params.remote = v.remote;
    if (v.salaryMin != null) params.salaryMin = v.salaryMin;
    if (v.salaryMax != null) params.salaryMax = v.salaryMax;
    if (v.technologies?.length) params.technologies = v.technologies;
    if (v.level?.length) params.level = v.level as ('junior' | 'mid' | 'senior')[];
    if (v.sort && v.sort !== 'newest') params.sort = v.sort as JobsQueryParams['sort'];
    this.filtersChange.emit(params);
  }
}
