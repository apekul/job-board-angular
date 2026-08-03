import { Router } from 'express';
import { query } from '../db/index.js';
import {
  toCompany,
  toJob,
  type CompanyRow,
  type CompanySummaryRow,
  type JobRow,
} from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';

export const companiesRouter = Router();

companiesRouter.get('/', async (_req, res) => {
  const rows = await query<CompanySummaryRow>(
    `SELECT c.id, c.name, c.slug, c.description, c.website, c.logo, c.created_at,
            COUNT(j.id)::int AS jobs_count
     FROM companies c
     LEFT JOIN jobs j ON j.company_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`,
  );

  res.json({
    data: rows.map((row) => ({ ...toCompany(row), jobsCount: row.jobs_count })),
  });
});

companiesRouter.get('/:id', async (req, res) => {
  const param = req.params.id;

  const [company] = await query<CompanyRow>(
    'SELECT * FROM companies WHERE id::text = $1 OR slug = $1',
    [param],
  );
  if (!company) throw new HttpError(404, 'Company not found');

  const jobRows = await query<JobRow>(
    `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
     FROM jobs j
     WHERE j.company_id = $1
     ORDER BY j.posted_at DESC`,
    [company.id],
  );

  res.json({
    data: {
      ...toCompany(company),
      jobs: jobRows.map(toJob),
    },
  });
});
