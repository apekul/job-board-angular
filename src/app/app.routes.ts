import { Routes } from '@angular/router';
import { MainLayout } from './layouts/app-layout/main.layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'jobs', pathMatch: 'full' },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs-list/jobs-list.component').then(
            (m) => m.JobsListComponent
          ),
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import('./features/jobs/job-detail/job-detail.component').then(
            (m) => m.JobDetailComponent
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'jobs' },
];
