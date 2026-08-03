import { Injectable, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'job-board:theme';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  readonly theme = signal<Theme>('light');

  readonly isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const initial = this.resolveInitialTheme();
      this.apply(initial);
      afterNextRender(() => {
        this.syncSystemPreference();
      });
    }
  }

  toggle(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  private resolveInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private syncSystemPreference(): void {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', (event) => {
      if (localStorage.getItem(THEME_KEY)) return;
      this.apply(event.matches ? 'dark' : 'light');
    });
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    this.isDark.set(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(THEME_KEY, theme);
    }
  }
}
