import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'job-board:favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly favorites = signal<string[]>(this.load());

  readonly count = computed(() => this.favorites().length);

  isFavorite(id: string): boolean {
    return this.favorites().includes(id);
  }

  add(id: string): void {
    if (!this.isFavorite(id)) {
      this.favorites.update((ids) => [...ids, id]);
      this.save();
    }
  }

  remove(id: string): void {
    this.favorites.update((ids) => ids.filter((i) => i !== id));
    this.save();
  }

  toggle(id: string): void {
    if (this.isFavorite(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favorites()));
  }
}
