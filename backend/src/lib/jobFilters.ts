export interface JobFilters {
  search?: string;
  location?: string;
  workMode?: 'remote' | 'onsite' | 'hybrid';
  salaryMin?: number;
  salaryMax?: number;
  technologies?: string[];
  level?: ('junior' | 'mid' | 'senior')[];
}

export function buildJobsWhere(filters: JobFilters): { where: string; values: unknown[] } {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.search) {
    const like = `%${filters.search}%`;
    conditions.push(
      `(title ILIKE $${values.length + 1} OR company ILIKE $${values.length + 2} OR EXISTS (SELECT 1 FROM unnest(technologies) t WHERE t ILIKE $${values.length + 3}))`,
    );
    values.push(like, like, like);
  }
  if (filters.location) {
    conditions.push(`location ILIKE $${values.length + 1}`);
    values.push(`%${filters.location}%`);
  }
  if (filters.workMode) {
    conditions.push(`work_mode = $${values.length + 1}`);
    values.push(filters.workMode);
  }
  if (filters.salaryMin !== undefined) {
    conditions.push(`salary_max >= $${values.length + 1}`);
    values.push(filters.salaryMin);
  }
  if (filters.salaryMax !== undefined) {
    conditions.push(`salary_min <= $${values.length + 1}`);
    values.push(filters.salaryMax);
  }
  if (filters.technologies?.length) {
    conditions.push(`technologies && $${values.length + 1}::text[]`);
    values.push(filters.technologies);
  }
  if (filters.level?.length) {
    conditions.push(`level = ANY($${values.length + 1}::text[])`);
    values.push(filters.level);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
}
