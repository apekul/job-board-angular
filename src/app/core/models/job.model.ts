export interface Job {
  id: string;
  title: string;
  company: string;
  companySlug?: string | null;
  companyLogo?: string;
  location: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
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
  workMode?: 'remote' | 'onsite' | 'hybrid';
  salaryMin?: number;
  salaryMax?: number;
  technologies?: string[];
  level?: ('junior' | 'mid' | 'senior')[];
  sort?: 'newest' | 'salary_asc' | 'salary_desc';
}
