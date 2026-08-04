import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JobsService } from './jobs.service';
import { Job, JobPage } from '../models/job.model';

const job: Job = {
  id: 'job-1',
  title: 'Frontend Developer',
  company: 'TechCorp',
  companySlug: 'techcorp',
  location: 'Warsaw',
  workMode: 'remote',
  salaryMin: 12000,
  salaryMax: 18000,
  currency: 'PLN',
  technologies: ['Angular', 'TypeScript'],
  level: 'mid',
  description: '<p>Join us.</p>',
  postedAt: '2026-08-01T00:00:00.000Z',
};

describe('JobsService', () => {
  let service: JobsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(JobsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getJobs sends filters, cursor and limit and returns the page', () => {
    const page: JobPage = { data: [job], nextCursor: 'next-cursor', hasMore: true };
    let result: JobPage | undefined;

    service
      .getJobs(
        {
          search: 'Angular',
          location: 'Warsaw',
          workMode: 'remote',
          salaryMin: 10000,
          salaryMax: 20000,
          technologies: ['Angular', 'RxJS'],
          level: ['mid'],
          sort: 'salary_desc',
        },
        'cursor-1',
      )
      .subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:4000/api/jobs' && r.method === 'GET',
    );
    expect(req.request.params.get('limit')).toBe('12');
    expect(req.request.params.get('search')).toBe('Angular');
    expect(req.request.params.get('location')).toBe('Warsaw');
    expect(req.request.params.get('workMode')).toBe('remote');
    expect(req.request.params.get('salaryMin')).toBe('10000');
    expect(req.request.params.get('salaryMax')).toBe('20000');
    expect(req.request.params.getAll('technologies')).toEqual(['Angular', 'RxJS']);
    expect(req.request.params.getAll('level')).toEqual(['mid']);
    expect(req.request.params.get('sort')).toBe('salary_desc');
    expect(req.request.params.get('cursor')).toBe('cursor-1');

    req.flush(page);
    expect(result).toEqual(page);
  });

  it('getJobs omits empty params', () => {
    service.getJobs().subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:4000/api/jobs' && r.method === 'GET',
    );
    expect(req.request.params.get('limit')).toBe('12');
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('cursor')).toBe(false);
    req.flush({ data: [], nextCursor: null, hasMore: false });
  });

  it('getJobById requests a single job', () => {
    let result: Job | undefined;
    service.getJobById('job-1').subscribe((res) => (result = res));

    const req = httpMock.expectOne('http://localhost:4000/api/jobs/job-1');
    expect(req.request.method).toBe('GET');
    req.flush(job);
    expect(result).toEqual(job);
  });

  it('getJobsByIds posts ids and maps the data array', () => {
    let result: Job[] | undefined;
    service.getJobsByIds(['job-1', 'job-2']).subscribe((res) => (result = res));

    const req = httpMock.expectOne('http://localhost:4000/api/jobs/batch');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ids: ['job-1', 'job-2'] });
    req.flush({ data: [job] });
    expect(result).toEqual([job]);
  });

  it('loadTechnologies stores distinct technologies', () => {
    service.loadTechnologies();

    const req = httpMock.expectOne('http://localhost:4000/api/technologies');
    expect(req.request.method).toBe('GET');
    req.flush({ data: ['Angular', 'React'] });
    expect(service.technologies()).toEqual(['Angular', 'React']);
  });

  it('loadTechnologies resets the signal on error', () => {
    service.technologies.set(['Angular']);
    service.loadTechnologies();

    const req = httpMock.expectOne('http://localhost:4000/api/technologies');
    req.flush('', { status: 500, statusText: 'Server Error' });
    expect(service.technologies()).toEqual([]);
  });
});
