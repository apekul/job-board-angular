import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SearchBarComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);
  private themeService = inject(ThemeService);

  favoritesCount = this.favoritesService.count;
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  isDark = this.themeService.isDark;

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  onSearch(value: string) {
    this.router.navigate(['/jobs'], {
      queryParams: { search: value || null },
      queryParamsHandling: 'merge',
    });
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen.set(false);
    this.router.navigate(['/jobs']);
  }
}
