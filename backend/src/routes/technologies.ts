import { Router } from 'express';
import { query } from '../db/index.js';

export const technologiesRouter = Router();

technologiesRouter.get('/', async (_req, res) => {
  const rows = await query<{ tech: string }>(
    'SELECT DISTINCT unnest(technologies) AS tech FROM jobs ORDER BY tech ASC',
  );
  res.json({ data: rows.map((row) => row.tech) });
});
