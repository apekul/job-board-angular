import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompanyDetail } from '../../core/models/company.model';
import { JobCardComponent } from '../../shared/job-card/job-card.component';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [RouterLink, JobCardComponent],
  templateUrl: './company-page.component.html',
})
export class CompanyPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  company = signal<CompanyDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const company = this.route.snapshot.data['company'] as CompanyDetail | null;
    if (company) {
      this.company.set(company);
    } else {
      this.error.set('Company not found.');
    }
    this.loading.set(false);
  }

  get initials(): string {
    return this.company()?.name.substring(0, 2).toUpperCase() ?? '';
  }
}
