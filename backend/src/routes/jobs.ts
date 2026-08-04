import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { toJob, type JobRow } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';
import { buildJobsWhere } from '../lib/jobFilters.js';

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
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const batchSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

const sortField = {
  newest: 'posted_at',
  salary_asc: 'salary_min',
  salary_desc: 'salary_min',
} as const;

const sortDirection = {
  newest: 'DESC',
  salary_asc: 'ASC',
  salary_desc: 'DESC',
} as const;

const cursorOperator = {
  newest: '<',
  salary_asc: '>',
  salary_desc: '<',
} as const;

type Cursor = { v: string | number; id: string };

function encodeCursor(value: string | number, id: string): string {
  return Buffer.from(JSON.stringify({ v: value, id })).toString('base64url');
}

function decodeCursor(raw: string): Cursor {
  return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Cursor;
}

function decodeCursorSafe(raw: string): Cursor {
  try {
    return decodeCursor(raw);
  } catch {
    throw new HttpError(400, 'Invalid cursor');
  }
}

export const jobsRouter = Router();

jobsRouter.get('/', async (req, res) => {
  const q = jobsQuerySchema.parse(req.query);

  const { where: filtersWhere, values } = buildJobsWhere(q);

  const cursor = q.cursor ? decodeCursorSafe(q.cursor) : null;
  const conditions: string[] = [];
  if (cursor) {
    conditions.push(
      `(${sortField[q.sort]}, id) ${cursorOperator[q.sort]} ($${values.length + 1}, $${values.length + 2})`,
    );
    values.push(cursor.v, cursor.id);
  }

  const where =
    filtersWhere || conditions.length
      ? `WHERE ${[filtersWhere.replace(/^WHERE\s+/, ''), ...conditions].filter(Boolean).join(' AND ')}`
      : '';
  const orderBy = `${sortField[q.sort]} ${sortDirection[q.sort]}, id ${sortDirection[q.sort]}`;

  const rows = await query<JobRow>(
    `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
     FROM jobs j ${where} ORDER BY ${orderBy} LIMIT $${values.length + 1}`,
    [...values, q.limit + 1],
  );

  const hasMore = rows.length > q.limit;
  const page = rows.slice(0, q.limit);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last[sortField[q.sort]], last.id) : null;

  res.json({ data: page.map(toJob), nextCursor, hasMore });
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
