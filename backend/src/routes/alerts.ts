import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { type JobAlertRow } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../lib/auth.js';

const filtersSchema = z
  .object({
    search: z.string().trim().optional(),
    location: z.string().trim().optional(),
    workMode: z.enum(['remote', 'onsite', 'hybrid']).optional(),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
    technologies: z.array(z.string()).optional(),
    level: z.array(z.enum(['junior', 'mid', 'senior'])).optional(),
  })
  .default({});

const createAlertSchema = z.object({
  name: z.string().trim().min(1).max(100),
  filters: filtersSchema,
});

export function toJobAlert(row: JobAlertRow) {
  return {
    id: row.id,
    name: row.name,
    filters: row.filters,
    createdAt: row.created_at,
  };
}

export const alertsRouter = Router();

alertsRouter.use(requireAuth);

alertsRouter.get('/', async (req, res) => {
  const rows = await query<JobAlertRow>(
    'SELECT * FROM job_alerts WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId],
  );
  res.json({ data: rows.map(toJobAlert) });
});

alertsRouter.post('/', async (req, res) => {
  const { name, filters } = createAlertSchema.parse(req.body);

  const [row] = await query<JobAlertRow>(
    `INSERT INTO job_alerts (user_id, name, filters)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.userId, name, JSON.stringify(filters)],
  );

  res.status(201).json({ data: toJobAlert(row) });
});

alertsRouter.delete('/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);

  const [existing] = await query<{ id: string }>(
    'SELECT id FROM job_alerts WHERE id = $1 AND user_id = $2',
    [id, req.userId],
  );
  if (!existing) throw new HttpError(404, 'Alert not found');

  await query('DELETE FROM job_alerts WHERE id = $1', [id]);
  res.status(204).end();
});
