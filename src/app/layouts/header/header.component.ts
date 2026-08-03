import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  private authService = inject(AuthService);
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  favoritesCount = this.favoritesService.count;
  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen.set(false);
    this.router.navigate(['/jobs']);
  }
}
