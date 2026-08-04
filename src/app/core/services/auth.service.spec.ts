import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

const TOKEN_KEY = 'job-board:token';
const USER_KEY = 'job-board:user';

const user: User = { id: 'user-1', email: 'john@example.com', name: 'John' };

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const service = TestBed.inject(AuthService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created logged out', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('login stores token and user and persists to localStorage', () => {
    const { service, httpMock } = setup();
    let emitted: { token: string; user: User } | undefined;
    service.login('john@example.com', 'secret').subscribe((res) => (emitted = res));

    const req = httpMock.expectOne('http://localhost:4000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'john@example.com', password: 'secret' });
    req.flush({ token: 'jwt-token', user });

    expect(emitted).toEqual({ token: 'jwt-token', user });
    expect(service.token()).toBe('jwt-token');
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    expect(localStorage.getItem(USER_KEY)).toContain('john@example.com');
    httpMock.verify();
  });

  it('register stores token and user and persists to localStorage', () => {
    const { service, httpMock } = setup();
    service.register('John', 'john@example.com', 'secret').subscribe();

    const req = httpMock.expectOne('http://localhost:4000/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'John',
      email: 'john@example.com',
      password: 'secret',
    });
    req.flush({ token: 'jwt-token', user });

    expect(service.token()).toBe('jwt-token');
    expect(service.user()).toEqual(user);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token');
    httpMock.verify();
  });

  it('logout clears session state and localStorage', () => {
    const { service, httpMock } = setup();
    service.login('john@example.com', 'secret').subscribe();
    httpMock.expectOne('http://localhost:4000/api/auth/login').flush({ token: 'jwt-token', user });
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    httpMock.verify();
  });

  it('restores the session from localStorage on init', () => {
    localStorage.setItem(TOKEN_KEY, 'restored-token');
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    const { service, httpMock } = setup();

    expect(service.token()).toBe('restored-token');
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
    httpMock.verify();
  });

  it('does not restore a session when no token is stored', () => {
    const { service, httpMock } = setup();
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    httpMock.verify();
  });
});
