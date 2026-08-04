import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AlertsService } from '../../core/services/alerts.service';
import { JobAlert, JobAlertFilters } from '../../core/models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './alerts.component.html',
})
export class AlertsComponent {
  private alertsService = inject(AlertsService);

  alerts = signal<JobAlert[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.alertsService.getAlerts().subscribe({
      next: (res) => {
        this.alerts.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load alerts. Please try again.');
        this.loading.set(false);
      },
    });
  }

  remove(id: string) {
    this.alertsService.remove(id).subscribe({
      next: () => this.alerts.update((list) => list.filter((alert) => alert.id !== id)),
      error: () => this.error.set('Failed to remove the alert. Please try again.'),
    });
  }

  describeFilters(filters: JobAlertFilters): string {
    const parts: string[] = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.location) parts.push(filters.location);
    if (filters.workMode) parts.push(filters.workMode);
    if (filters.salaryMin !== undefined && filters.salaryMax !== undefined) {
      parts.push(`${filters.salaryMin}–${filters.salaryMax}`);
    } else if (filters.salaryMin !== undefined) {
      parts.push(`from ${filters.salaryMin}`);
    } else if (filters.salaryMax !== undefined) {
      parts.push(`up to ${filters.salaryMax}`);
    }
    if (filters.technologies?.length) parts.push(filters.technologies.join(', '));
    if (filters.level?.length) parts.push(filters.level.join(', '));
    return parts.length ? parts.join(' · ') : 'All jobs';
  }
}
