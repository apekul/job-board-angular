export interface JobAlertFilters {
  search?: string;
  location?: string;
  workMode?: 'remote' | 'onsite' | 'hybrid';
  salaryMin?: number;
  salaryMax?: number;
  technologies?: string[];
  level?: ('junior' | 'mid' | 'senior')[];
}

export interface JobAlert {
  id: string;
  name: string;
  filters: JobAlertFilters;
  createdAt: string;
}
