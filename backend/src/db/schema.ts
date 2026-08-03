export const CREATE_JOBS_TABLE = `
  CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    company_logo VARCHAR(500),
    location VARCHAR(200) NOT NULL,
    work_mode VARCHAR(20) NOT NULL,
    salary_min INTEGER NOT NULL,
    salary_max INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    technologies TEXT[] NOT NULL DEFAULT '{}',
    level VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    apply_url VARCHAR(500),
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const WORK_MODES = ['remote', 'onsite', 'hybrid'] as const;
export const LEVELS = ['junior', 'mid', 'senior'] as const;
export const SORTS = ['newest', 'salary_asc', 'salary_desc'] as const;

export interface JobRow {
  id: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  work_mode: (typeof WORK_MODES)[number];
  salary_min: number;
  salary_max: number;
  currency: string;
  technologies: string[];
  level: (typeof LEVELS)[number];
  description: string;
  apply_url: string | null;
  posted_at: string;
}

export function toJob(row: JobRow) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyLogo: row.company_logo,
    location: row.location,
    workMode: row.work_mode,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    technologies: row.technologies,
    level: row.level,
    description: row.description,
    applyUrl: row.apply_url,
    postedAt: row.posted_at,
  };
}
