import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { FavoritesComponent } from './favorites.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { JobsService } from '../../core/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';
import { Job } from '../../core/models/job.model';

const jobs: Job[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    companySlug: 'techcorp',
    location: 'Warsaw',
    workMode: 'remote',
    salaryMin: 12000,
    salaryMax: 18000,
    currency: 'PLN',
    technologies: ['Angular'],
    level: 'mid',
    description: '<p>Join us.</p>',
    postedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'job-2',
    title: 'Backend Engineer',
    company: 'DataSystems',
    location: 'Krakow',
    workMode: 'onsite',
    salaryMin: 15000,
    salaryMax: 22000,
    currency: 'PLN',
    technologies: ['Node.js'],
    level: 'senior',
    description: '<p>Build APIs.</p>',
    postedAt: '2026-08-01T00:00:00.000Z',
  },
];

class MockFavoritesService {
  readonly favorites = signal<string[]>([]);
  readonly count = computed(() => this.favorites().length);
  isFavorite = () => false;
  toggle = () => {};
}

class MockJobsService {
  getJobsByIds = (ids: string[]) => of(jobs.filter((j) => ids.includes(j.id)));
  technologies = signal<string[]>([]);
  loadTechnologies() {}
}

describe('FavoritesComponent', () => {
  let fixture: ComponentFixture<FavoritesComponent>;
  let component: FavoritesComponent;
  let favoritesService: MockFavoritesService;

  beforeEach(async () => {
    favoritesService = new MockFavoritesService();

    const authStub = {
      token: signal<string | null>(null),
      user: signal(null),
      isAuthenticated: computed(() => false),
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesService },
        { provide: JobsService, useClass: MockJobsService },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('shows the empty state when there are no favorites', () => {
    expect(fixture.nativeElement.textContent).toContain('No favorite offers yet.');
    expect(fixture.nativeElement.querySelectorAll('app-job-card').length).toBe(0);
  });

  it('loads and renders jobs for the favorite ids', () => {
    favoritesService.favorites.set(['job-1', 'job-2']);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-job-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Frontend Developer');
    expect(fixture.nativeElement.textContent).toContain('Backend Engineer');
  });

  it('clears the jobs when favorites become empty', () => {
    favoritesService.favorites.set(['job-1']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-job-card').length).toBe(1);

    favoritesService.favorites.set([]);
    fixture.detectChanges();

    expect(component.jobs()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No favorite offers yet.');
  });
});
