import 'dotenv/config';
import { query } from '../db/index.js';
import { toJob, type JobAlertRow, type JobRow } from '../db/schema.js';
import { buildJobsWhere } from '../lib/jobFilters.js';

const DAILY_LIMIT = Number(process.env.ALERT_DAILY_LIMIT ?? 100);

type AlertWithEmail = JobAlertRow & { email: string };

function describeFilters(filters: Record<string, unknown>): string {
  const parts: string[] = [];
  const technologies = (filters.technologies ?? []) as string[];
  const levels = (filters.level ?? []) as string[];
  if (filters.search) parts.push(`"${filters.search}"`);
  if (filters.location) parts.push(filters.location as string);
  if (filters.workMode) parts.push(filters.workMode as string);
  if (technologies.length) parts.push(technologies.join(', '));
  if (levels.length) parts.push(levels.join(', '));
  return parts.join(' · ') || 'all offers';
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM ?? 'Job Board <alerts@example.com>';
  if (!apiKey) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    console.error(`Email send failed (${res.status}): ${await res.text()}`);
    return false;
  }
  return true;
}

async function main() {
  const [{ count: sentToday }] = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM alert_notifications
     WHERE sent_at >= date_trunc('day', NOW())`,
  );
  let budget = DAILY_LIMIT - sentToday;
  console.log(`[alerts] ${sentToday} sent today, budget ${budget}`);

  const alerts = await query<AlertWithEmail>(
    `SELECT a.*, u.email FROM job_alerts a JOIN users u ON u.id = a.user_id`,
  );
  if (!alerts.length) {
    console.log('[alerts] no saved alerts');
    return;
  }

  let emailed = 0;
  let recorded = 0;

  for (const alert of alerts) {
    if (budget <= 0) {
      console.log('[alerts] daily limit reached, skipping remaining alerts');
      break;
    }

    const filters = (alert.filters ?? {}) as Record<string, unknown>;
    const { where, values } = buildJobsWhere(filters);
    const rows = await query<JobRow>(
      `SELECT j.*, (SELECT c.slug FROM companies c WHERE c.id = j.company_id) AS company_slug
       FROM jobs j ${where}
       AND j.id NOT IN (SELECT job_id FROM alert_notifications WHERE alert_id = $${values.length + 1})
       ORDER BY j.posted_at DESC
       LIMIT $${values.length + 2}`,
      [...values, alert.id, Math.min(10, budget)],
    );

    if (!rows.length) continue;

    const notified: string[] = [];
    for (const job of rows) {
      await query(
        `INSERT INTO alert_notifications (alert_id, job_id)
         VALUES ($1, $2)
         ON CONFLICT (alert_id, job_id) DO NOTHING`,
        [alert.id, job.id],
      );
      notified.push(job.id);
      recorded++;
    }
    budget -= notified.length;

    const jobs = rows.filter((job) => notified.includes(job.id));
    const lines = jobs
      .map(
        (job) =>
          `<li><strong>${job.title}</strong> @ ${job.company} (${job.location}, ${job.work_mode}, ${job.salary_min}–${job.salary_max} ${job.currency}) — <a href="${job.apply_url ?? '#'}">Apply</a></li>`,
      )
      .join('');

    const html = `
      <h2>New matching offers: ${alert.name}</h2>
      <p>Filters: ${describeFilters(filters)}</p>
      <ul>${lines}</ul>`;

    const sent = await sendEmail(alert.email, `New matching job offers (${jobs.length})`, html);
    if (sent) emailed++;
    console.log(
      `[alerts] alert "${alert.name}" (${alert.email}): ${jobs.length} new job(s), email ${sent ? 'sent' : 'skipped (no RESEND_API_KEY)'}`,
    );
  }

  console.log(`[alerts] done: ${recorded} notification(s) recorded, ${emailed} email(s) sent`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
