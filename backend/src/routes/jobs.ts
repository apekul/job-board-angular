import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { toJob, type JobRow } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';

function splitList(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(',');
  return undefined;
}

const jobsQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  salaryMin: z.coerce.number().int().positive().optional(),
  salaryMax: z.coerce.number().int().positive().optional(),
  technologies: z.preprocess(splitList, z.array(z.string()).optional()),
  level: z.preprocess(splitList, z.array(z.enum(['junior', 'mid', 'senior'])).optional()),
  sort: z.enum(['newest', 'salary_asc', 'salary_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const batchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

const sortClause = {
  newest: 'posted_at DESC',
  salary_asc: 'salary_min ASC',
  salary_desc: 'salary_min DESC',
} as const;

export const jobsRouter = Router();

jobsRouter.get('/', async (req, res) => {
  const q = jobsQuerySchema.parse(req.query);

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (q.search) {
    const like = `%${q.search}%`;
    conditions.push(
      `(title ILIKE $${values.length + 1} OR company ILIKE $${values.length + 2} OR EXISTS (SELECT 1 FROM unnest(technologies) t WHERE t ILIKE $${values.length + 3}))`,
    );
    values.push(like, like, like);
  }
  if (q.location) {
    conditions.push(`location ILIKE $${values.length + 1}`);
    values.push(`%${q.location}%`);
  }
  if (q.workMode) {
    conditions.push(`work_mode = $${values.length + 1}`);
    values.push(q.workMode);
  }
  if (q.salaryMin !== undefined) {
    conditions.push(`salary_max >= $${values.length + 1}`);
    values.push(q.salaryMin);
  }
  if (q.salaryMax !== undefined) {
    conditions.push(`salary_min <= $${values.length + 1}`);
    values.push(q.salaryMax);
  }
  if (q.technologies?.length) {
    conditions.push(`technologies && $${values.length + 1}::text[]`);
    values.push(q.technologies);
  }
  if (q.level?.length) {
    conditions.push(`level = ANY($${values.length + 1}::text[])`);
    values.push(q.level);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (q.page - 1) * q.limit;

  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM jobs ${where}`,
    values,
  );
  const rows = await query<JobRow>(
    `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
     FROM jobs j ${where} ORDER BY ${sortClause[q.sort]} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, q.limit, offset],
  );

  res.json({ data: rows.map(toJob), total, page: q.page, limit: q.limit });
});

jobsRouter.post('/batch', async (req, res) => {
  const { ids } = batchSchema.parse(req.body);
  const rows = await query<JobRow>(
    `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
     FROM jobs j WHERE j.id = ANY($1::uuid[])`,
    [ids],
  );
  res.json({ data: rows.map(toJob) });
});

jobsRouter.get('/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const [row] = await query<JobRow>(
    `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
     FROM jobs j WHERE j.id = $1`,
    [id],
  );
  if (!row) throw new HttpError(404, 'Job not found');
  res.json(toJob(row));
});
