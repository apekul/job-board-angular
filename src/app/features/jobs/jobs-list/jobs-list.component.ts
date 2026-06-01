import { Component, inject, signal, OnInit } from '@angular/core';
import { JobsService } from '../../../core/services/jobs.service';
import { Job } from '../../../core/models/job.model';
import { JobCardComponent } from '../../../shared/job-card/job-card.component';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [JobCardComponent],
  templateUrl: './jobs-list.component.html',
})
export class JobsListComponent implements OnInit {
  private jobsService = inject(JobsService);

  jobs = signal<Job[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.jobsService.getJobs().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load jobs. Please try again.');
        this.loading.set(false);
      },
    });
  }

  retry() {
    this.loading.set(true);
    this.error.set(null);
    this.ngOnInit();
  }
}
