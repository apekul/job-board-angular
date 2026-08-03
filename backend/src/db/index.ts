import { Pool, type QueryResultRow } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export function query<T extends QueryResultRow>(text: string, values?: unknown[]): Promise<T[]> {
  return pool.query<T>(text, values as any[]).then((result) => result.rows);
}
