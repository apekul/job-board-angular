import { Job } from './job.model';

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logo?: string | null;
}

export interface CompanySummary extends Company {
  jobsCount: number;
}

export interface CompanyDetail extends Company {
  jobs: Job[];
}
