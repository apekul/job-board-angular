import { Component, input, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Job } from '../../core/models/job.model';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [DecimalPipe, FavoriteButtonComponent],
  templateUrl: './job-card.component.html',
})
export class JobCardComponent {
  job = input.required<Job>();

  private router = inject(Router);

  navigate() {
    this.router.navigate(['/jobs', this.job().id]);
  }

  get initials(): string {
    return this.job().company.substring(0, 2).toUpperCase();
  }

  get visibleTechnologies(): string[] {
    return this.job().technologies.slice(0, 4);
  }

  get extraTechnologiesCount(): number {
    return Math.max(0, this.job().technologies.length - 4);
  }

  get relativeDate(): string {
    const posted = new Date(this.job().postedAt);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;

    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  }
}
