import { RenderMode, ServerRoute } from '@angular/ssr';

const API_URL = process.env['API_URL'] ?? 'https://job-board-angular.onrender.com/api';

export const serverRoutes: ServerRoute[] = [
  { path: 'jobs/:id', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'favorites', renderMode: RenderMode.Client },
  { path: 'applications', renderMode: RenderMode.Client },
  { path: 'alerts', renderMode: RenderMode.Client },
  {
    path: 'companies/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      try {
        const res = await fetch(`${API_URL}/companies`, {
          signal: AbortSignal.timeout(5000),
        });
        const { data } = (await res.json()) as { data: { slug: string }[] };
        return data.map((company) => ({ slug: company.slug }));
      } catch {
        return [];
      }
    },
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
