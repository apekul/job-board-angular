export const CREATE_COMPANIES_TABLE = `
  CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(500),
    logo VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_JOBS_TABLE = `
  CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
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

export const ALTER_JOBS_ADD_COMPANY_ID = `
  ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
`;

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_FAVORITES_TABLE = `
  CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, job_id)
  );
`;

export const CREATE_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'applied'
      CHECK (status IN ('applied', 'interview', 'offer', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, job_id)
  );
`;

export const CREATE_APPLICATION_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_JOB_ALERTS_TABLE = `
  CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_ALERT_NOTIFICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES job_alerts(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (alert_id, job_id)
  );
`;

export const APPLICATION_STATUSES = ['applied', 'interview', 'offer', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const WORK_MODES = ['remote', 'onsite', 'hybrid'] as const;
export const LEVELS = ['junior', 'mid', 'senior'] as const;
export const SORTS = ['newest', 'salary_asc', 'salary_desc'] as const;

export interface JobRow {
  id: string;
  title: string;
  company: string;
  company_id: string | null;
  company_slug: string | null;
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

export interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  created_at: string;
}

export interface CompanySummaryRow extends CompanyRow {
  jobs_count: number;
}

export interface ApplicationRow {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  created_at: string;
}

export interface JobAlertRow {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  created_at: string;
}

export function toUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

export function toCompany(row: CompanyRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    website: row.website,
    logo: row.logo,
  };
}

export function toJob(row: JobRow) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companySlug: row.company_slug,
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
