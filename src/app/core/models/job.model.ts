export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  technologies: string[];
  level: 'junior' | 'mid' | 'senior';
  description: string;
  postedAt: string;
  applyUrl?: string;
}

export interface JobsQueryParams {
  search?: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  technologies?: string[];
  level?: 'junior' | 'mid' | 'senior';
  sort?: string;
}
