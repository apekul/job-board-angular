import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FiltersComponent } from './filters.component';
import { JobsService } from '../../../core/services/jobs.service';
import { JobsQueryParams } from '../../../core/models/job.model';

class MockJobsService {
  readonly technologies = signal<string[]>(['Angular', 'React', 'Node.js']);
  loadTechnologies() {}
}

describe('FiltersComponent', () => {
  let fixture: ComponentFixture<FiltersComponent>;
  let component: FiltersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersComponent],
      providers: [{ provide: JobsService, useClass: MockJobsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('exposes technologies from the jobs service', () => {
    expect(component.technologies()).toEqual(['Angular', 'React', 'Node.js']);
  });

  it('syncs the form from the filters input', () => {
    fixture.componentRef.setInput('filters', {
      workMode: 'remote',
      salaryMin: 10000,
      technologies: ['Angular'],
      level: ['mid'],
      sort: 'salary_desc',
    } satisfies JobsQueryParams);
    fixture.detectChanges();

    expect(component.form.value.workMode).toBe('remote');
    expect(component.form.value.salaryMin).toBe(10000);
    expect(component.form.value.technologies).toEqual(['Angular']);
    expect(component.form.value.level).toEqual(['mid']);
    expect(component.form.value.sort).toBe('salary_desc');
  });

  it('toggles technologies and levels', () => {
    component.toggleTechnology('Angular');
    expect(component.form.value.technologies).toEqual(['Angular']);

    component.toggleTechnology('Angular');
    expect(component.form.value.technologies).toEqual([]);

    component.toggleLevel('mid');
    expect(component.form.value.level).toEqual(['mid']);
  });

  it('sets the work mode', () => {
    component.setWorkMode('hybrid');
    expect(component.form.value.workMode).toBe('hybrid');
  });

  it('emits filters when the form changes', () => {
    vi.useFakeTimers();
    const emitted: JobsQueryParams[] = [];
    component.filtersChange.subscribe((p) => emitted.push(p));

    component.form.patchValue({ location: 'Warsaw' });
    vi.advanceTimersByTime(300);

    expect(emitted).toEqual([{ location: 'Warsaw' }]);
  });

  it('emits an empty object when clearing filters', () => {
    const emitted: JobsQueryParams[] = [];
    component.filtersChange.subscribe((p) => emitted.push(p));

    component.clearFilters();

    expect(emitted).toEqual([{}]);
  });

  it('counts active filters', () => {
    expect(component.activeCount()).toBe(0);

    fixture.componentRef.setInput('filters', {
      workMode: 'remote',
      level: ['mid', 'senior'],
    } satisfies JobsQueryParams);
    fixture.detectChanges();

    expect(component.activeCount()).toBe(2);
  });
});
