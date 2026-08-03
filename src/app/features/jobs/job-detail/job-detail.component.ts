import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ApplicationStatus } from '../../../core/models/application.model';
import { Job } from '../../../core/models/job.model';
import { FavoriteButtonComponent } from '../../../shared/favorite-button/favorite-button.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FavoriteButtonComponent],
  templateUrl: './job-detail.component.html',
})
export class JobDetailComponent implements OnInit {
  private jobsService = inject(JobsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private applicationsService = inject(ApplicationsService);

  job = signal<Job | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  isAuthenticated = this.authService.isAuthenticated;

  applied = computed(() =>
    this.applicationsService.applications().find((a) => a.jobId === this.job()?.id),
  );

  readonly statusLabels: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
  };

  statusBadgeClass(status: ApplicationStatus): string {
    return {
      applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      interview: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    }[status];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/jobs']);
      return;
    }

    this.jobsService.getJobById(id).subscribe({
      next: (job) => {
        if (!job) {
          this.error.set('Job not found.');
        } else {
          this.job.set(job);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load job details. Please try again.');
        this.loading.set(false);
      },
    });
  }

  apply() {
    const job = this.job();
    if (!job) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.applicationsService.apply(job.id).subscribe({
      error: (err) => {
        if (err.status !== 409) {
          console.error('Failed to apply', err);
        }
      },
    });
  }
}
