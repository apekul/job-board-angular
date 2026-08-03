import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
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

  job = signal<Job | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

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
}
