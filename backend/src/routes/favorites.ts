import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../lib/auth.js';

const addFavoriteSchema = z.object({
  jobId: z.string().uuid(),
});

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.get('/', async (req, res) => {
  const rows = await query<{ job_id: string }>(
    'SELECT job_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
    [req.userId],
  );
  res.json({ data: rows.map((row) => row.job_id) });
});

favoritesRouter.post('/', async (req, res) => {
  const { jobId } = addFavoriteSchema.parse(req.body);

  const [job] = await query<{ id: string }>('SELECT id FROM jobs WHERE id = $1', [jobId]);
  if (!job) throw new HttpError(404, 'Job not found');

  await query(
    `INSERT INTO favorites (user_id, job_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, job_id) DO NOTHING`,
    [req.userId, jobId],
  );
  res.status(201).json({ data: jobId });
});

favoritesRouter.delete('/:jobId', async (req, res) => {
  const jobId = z.string().uuid().parse(req.params.jobId);
  await query('DELETE FROM favorites WHERE user_id = $1 AND job_id = $2', [req.userId, jobId]);
  res.status(204).end();
});
