import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobCardComponent } from '../../shared/job-card/job-card.component';
import { FavoritesService } from '../../core/services/favorites.service';
import { JobsService } from '../../core/services/jobs.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, JobCardComponent],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  private favoritesService = inject(FavoritesService);
  private jobsService = inject(JobsService);

  favorites = this.favoritesService.favorites;

  jobs = signal<Job[]>([]);

  constructor() {
    effect(() => {
      const ids = this.favorites();
      if (ids.length === 0) {
        this.jobs.set([]);
        return;
      }
      this.jobsService.getJobsByIds(ids).subscribe((jobs) => this.jobs.set(jobs));
    });
  }
}
