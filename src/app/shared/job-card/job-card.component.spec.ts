import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { JobCardComponent } from './job-card.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models/job.model';

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: 'job-1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    companySlug: 'techcorp',
    location: 'Warsaw',
    workMode: 'remote',
    salaryMin: 12000,
    salaryMax: 18000,
    currency: 'PLN',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'TailwindCSS', 'Karma'],
    level: 'mid',
    description: '<p>Join us.</p>',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

describe('JobCardComponent', () => {
  let fixture: ComponentFixture<JobCardComponent>;
  let component: JobCardComponent;
  let router: Router;

  beforeEach(async () => {
    const favoritesStub = {
      favorites: signal<string[]>([]),
      count: computed(() => 0),
      isFavorite: () => false,
      toggle: () => {},
    };
    const authStub = {
      token: signal<string | null>(null),
      user: signal(null),
      isAuthenticated: computed(() => false),
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [JobCardComponent],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('renders the job details', () => {
    fixture.componentRef.setInput('job', makeJob());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Frontend Developer');
    expect(text).toContain('TechCorp');
    expect(text).toContain('Warsaw');
    expect(text).toContain('Remote');
    expect(text).toContain('Mid');
    expect(text).toContain('12,000 – 18,000 PLN');
    expect(text).toContain('3 days ago');
  });

  it('shows company initials when there is no logo', () => {
    fixture.componentRef.setInput('job', makeJob());
    fixture.detectChanges();

    expect(component.initials).toBe('TE');
    expect(fixture.nativeElement.textContent).toContain('TE');
  });

  it('shows at most 4 technologies and the remaining count', () => {
    fixture.componentRef.setInput('job', makeJob());
    fixture.detectChanges();

    expect(component.visibleTechnologies).toEqual(['Angular', 'TypeScript', 'RxJS', 'TailwindCSS']);
    expect(component.extraTechnologiesCount).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('+1 more');
  });

  it('computes relative date labels', () => {
    fixture.componentRef.setInput('job', makeJob({ postedAt: new Date().toISOString() }));
    expect(component.relativeDate).toBe('Today');

    fixture.componentRef.setInput(
      'job',
      makeJob({ postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }),
    );
    expect(component.relativeDate).toBe('1 day ago');

    fixture.componentRef.setInput(
      'job',
      makeJob({ postedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }),
    );
    expect(component.relativeDate).toBe('2 months ago');
  });

  it('navigates to the job detail on navigate()', () => {
    fixture.componentRef.setInput('job', makeJob());
    fixture.detectChanges();
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.navigate();

    expect(navigateSpy).toHaveBeenCalledWith(['/jobs', 'job-1']);
  });
});
