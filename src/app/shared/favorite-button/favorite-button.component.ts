import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  templateUrl: './favorite-button.component.html',
})
export class FavoriteButtonComponent {
  jobId = input.required<string>();
  label = input('');

  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isFavorite = computed(() => this.favoritesService.isFavorite(this.jobId()));

  toggle() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    this.favoritesService.toggle(this.jobId());
  }
}
