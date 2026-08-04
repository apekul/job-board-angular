import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { FavoritesService } from './favorites.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

class MockAuthService {
  readonly token = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);
  logout = () => {};
}

describe('FavoritesService', () => {
  let service: FavoritesService;
  let httpMock: HttpTestingController;
  let mockAuth: MockAuthService;

  beforeEach(() => {
    mockAuth = new MockAuthService();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuth },
      ],
    });
    service = TestBed.inject(FavoritesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with empty favorites', () => {
    expect(service).toBeTruthy();
    expect(service.favorites()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('isFavorite reflects the favorites signal', () => {
    service.favorites.set(['job-1']);
    expect(service.isFavorite('job-1')).toBe(true);
    expect(service.isFavorite('job-2')).toBe(false);
  });

  it('adds a favorite after the POST resolves', () => {
    service.add('job-1');

    const req = httpMock.expectOne('http://localhost:4000/api/favorites');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ jobId: 'job-1' });
    req.flush({ data: 'job-1' });

    expect(service.isFavorite('job-1')).toBe(true);
    expect(service.count()).toBe(1);
  });

  it('does not duplicate an existing favorite', () => {
    service.add('job-1');
    httpMock.expectOne('http://localhost:4000/api/favorites').flush({ data: 'job-1' });
    service.add('job-1');
    httpMock.expectOne('http://localhost:4000/api/favorites').flush({ data: 'job-1' });

    expect(service.favorites()).toEqual(['job-1']);
    expect(service.count()).toBe(1);
  });

  it('removes a favorite after the DELETE resolves', () => {
    service.favorites.set(['job-1', 'job-2']);
    service.remove('job-1');

    const req = httpMock.expectOne('http://localhost:4000/api/favorites/job-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.isFavorite('job-1')).toBe(false);
    expect(service.favorites()).toEqual(['job-2']);
  });

  it('toggle adds when missing and removes when present', () => {
    service.toggle('job-1');
    httpMock.expectOne('http://localhost:4000/api/favorites').flush({ data: 'job-1' });
    expect(service.isFavorite('job-1')).toBe(true);

    service.toggle('job-1');
    httpMock.expectOne('http://localhost:4000/api/favorites/job-1').flush(null);
    expect(service.isFavorite('job-1')).toBe(false);
  });

  it('refresh loads favorites from the server', () => {
    service.refresh();

    const req = httpMock.expectOne('http://localhost:4000/api/favorites');
    expect(req.request.method).toBe('GET');
    req.flush({ data: ['job-a', 'job-b'] });

    expect(service.favorites()).toEqual(['job-a', 'job-b']);
  });

  it('clears favorites when refresh fails', () => {
    service.favorites.set(['job-a']);
    service.refresh();

    const req = httpMock.expectOne('http://localhost:4000/api/favorites');
    req.flush('', { status: 500, statusText: 'Server Error' });

    expect(service.favorites()).toEqual([]);
  });

  it('refreshes favorites when the user becomes authenticated', () => {
    mockAuth.token.set('token');
    TestBed.flushEffects();

    const req = httpMock.expectOne('http://localhost:4000/api/favorites');
    req.flush({ data: ['job-1'] });

    expect(service.favorites()).toEqual(['job-1']);
  });

  it('clears favorites when the user logs out', () => {
    service.favorites.set(['job-1', 'job-2']);

    mockAuth.token.set('token');
    TestBed.flushEffects();
    httpMock.expectOne('http://localhost:4000/api/favorites').flush({ data: ['job-1', 'job-2'] });

    mockAuth.token.set(null);
    TestBed.flushEffects();

    expect(service.favorites()).toEqual([]);
  });
});
