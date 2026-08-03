import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApplicationsService } from '../../core/services/applications.service';
import { Application, ApplicationStatus } from '../../core/models/application.model';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './applications.component.html',
})
export class ApplicationsComponent {
  private applicationsService = inject(ApplicationsService);

  applications = this.applicationsService.applications;

  readonly statuses: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected'];

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

  updateStatus(application: Application, status: ApplicationStatus) {
    if (application.status === status) return;
    this.applicationsService.updateStatus(application.id, status).subscribe();
  }

  relativeDate(date: string): string {
    const diffMs = Math.max(0, Date.now() - new Date(date).getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }
}
