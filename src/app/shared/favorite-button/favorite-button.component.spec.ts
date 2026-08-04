import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { computed, signal } from '@angular/core';
import { FavoriteButtonComponent } from './favorite-button.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';

describe('FavoriteButtonComponent', () => {
  let fixture: ComponentFixture<FavoriteButtonComponent>;
  let component: FavoriteButtonComponent;
  let router: Router;

  let favoritesStub: {
    favorites: ReturnType<typeof signal<string[]>>;
    count: ReturnType<typeof computed<number>>;
    isFavorite: (id: string) => boolean;
    toggle: () => void;
  };
  let authStub: {
    token: ReturnType<typeof signal<string | null>>;
    user: ReturnType<typeof signal<unknown>>;
    isAuthenticated: ReturnType<typeof computed<boolean>>;
    logout: () => void;
  };

  beforeEach(async () => {
    favoritesStub = {
      favorites: signal<string[]>([]),
      count: computed(() => 0),
      isFavorite: (id: string) => favoritesStub.favorites().includes(id),
      toggle: () => {},
    };
    authStub = {
      token: signal<string | null>(null),
      user: signal(null),
      isAuthenticated: computed(() => authStub.token() !== null),
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favoritesStub },
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('jobId', 'job-1');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('redirects to login when the user is not authenticated', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const toggleSpy = vi.spyOn(favoritesStub, 'toggle');

    component.toggle();

    expect(toggleSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: router.url },
    });
  });

  it('toggles the favorite when the user is authenticated', () => {
    authStub.token.set('token');
    const toggleSpy = vi.spyOn(favoritesStub, 'toggle');

    component.toggle();

    expect(toggleSpy).toHaveBeenCalledWith('job-1');
  });

  it('reflects the favorite state in the aria-label', () => {
    favoritesStub.favorites.set(['job-1']);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Remove from favorites');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
