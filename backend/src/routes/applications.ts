import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireAuth } from '../lib/auth.js';
import { toJob, type ApplicationRow, type JobRow } from '../db/schema.js';

const APPLICATION_STATUSES = ['applied', 'interview', 'offer', 'rejected'] as const;

const createSchema = z.object({
  jobId: z.string().uuid(),
});

const patchSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

type ApplicationEventRow = {
  application_id: string;
  status: (typeof APPLICATION_STATUSES)[number];
  created_at: string;
};

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', async (req, res) => {
  const rows = await query<ApplicationRow & JobRow>(
    `SELECT a.id, a.status, a.created_at, a.updated_at, a.job_id,
            j.title, j.company, j.company_logo, j.location, j.work_mode,
            j.salary_min, j.salary_max, j.currency, j.technologies, j.level,
            j.description, j.apply_url, j.posted_at
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = $1
     ORDER BY a.updated_at DESC`,
    [req.userId],
  );

  const eventRows = await query<ApplicationEventRow>(
    `SELECT e.application_id, e.status, e.created_at
     FROM application_events e
     JOIN applications a ON a.id = e.application_id
     WHERE a.user_id = $1
     ORDER BY e.created_at ASC`,
    [req.userId],
  );

  const eventsByApp = new Map<
    string,
    { status: ApplicationEventRow['status']; createdAt: string }[]
  >();
  for (const event of eventRows) {
    const list = eventsByApp.get(event.application_id) ?? [];
    list.push({ status: event.status, createdAt: event.created_at });
    eventsByApp.set(event.application_id, list);
  }

  const data = rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events: eventsByApp.get(row.id) ?? [],
    job: toJob(row),
  }));

  res.json({ data });
});

applicationsRouter.post('/', async (req, res) => {
  const { jobId } = createSchema.parse(req.body);

  const [job] = await query<{ id: string }>('SELECT id FROM jobs WHERE id = $1', [jobId]);
  if (!job) throw new HttpError(404, 'Job not found');

  const [existing] = await query<{ id: string }>(
    'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
    [req.userId, jobId],
  );
  if (existing) throw new HttpError(409, 'Already applied to this job');

  const [app] = await query<ApplicationRow>(
    `INSERT INTO applications (user_id, job_id, status)
     VALUES ($1, $2, 'applied')
     RETURNING id, user_id, job_id, status, created_at, updated_at`,
    [req.userId, jobId],
  );
  await query('INSERT INTO application_events (application_id, status) VALUES ($1, $2)', [
    app.id,
    'applied',
  ]);

  res.status(201).json({
    data: {
      id: app.id,
      jobId: app.job_id,
      status: app.status,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
    },
  });
});

applicationsRouter.patch('/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = patchSchema.parse(req.body);

  const [existing] = await query<{ id: string }>(
    'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
    [id, req.userId],
  );
  if (!existing) throw new HttpError(404, 'Application not found');

  await query('UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2', [
    status,
    id,
  ]);
  await query('INSERT INTO application_events (application_id, status) VALUES ($1, $2)', [
    id,
    status,
  ]);

  const [app] = await query<ApplicationRow>(
    'SELECT id, user_id, job_id, status, created_at, updated_at FROM applications WHERE id = $1',
    [id],
  );

  res.json({
    data: {
      id: app.id,
      jobId: app.job_id,
      status: app.status,
      createdAt: app.created_at,
      updatedAt: app.updated_at,
    },
  });
});
