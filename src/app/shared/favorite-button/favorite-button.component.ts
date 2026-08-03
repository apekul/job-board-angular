import { Component, computed, inject, input } from '@angular/core';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  templateUrl: './favorite-button.component.html',
})
export class FavoriteButtonComponent {
  jobId = input.required<string>();
  label = input('');

  private favoritesService = inject(FavoritesService);

  isFavorite = computed(() => this.favoritesService.isFavorite(this.jobId()));

  toggle() {
    this.favoritesService.toggle(this.jobId());
  }
}
