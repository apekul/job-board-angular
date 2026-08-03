import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  private favoritesService = inject(FavoritesService);

  favoritesCount = this.favoritesService.count;

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }
}
