import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly apiUrl = environment.apiUrl;

  readonly favorites = signal<string[]>([]);

  readonly count = computed(() => this.favorites().length);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refresh();
      } else {
        this.favorites.set([]);
      }
    });
  }

  isFavorite(id: string): boolean {
    return this.favorites().includes(id);
  }

  refresh(): void {
    this.http.get<{ data: string[] }>(`${this.apiUrl}/favorites`).subscribe({
      next: (res) => this.favorites.set(res.data),
      error: () => this.favorites.set([]),
    });
  }

  add(id: string): void {
    this.http.post<{ data: string }>(`${this.apiUrl}/favorites`, { jobId: id }).subscribe({
      next: () => this.favorites.update((ids) => (ids.includes(id) ? ids : [...ids, id])),
    });
  }

  remove(id: string): void {
    this.http.delete(`${this.apiUrl}/favorites/${id}`).subscribe({
      next: () => this.favorites.update((ids) => ids.filter((i) => i !== id)),
    });
  }

  toggle(id: string): void {
    if (this.isFavorite(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }
}
