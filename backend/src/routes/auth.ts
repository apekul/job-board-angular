import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/index.js';
import { toUser, type UserRow } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';
import { hashPassword, requireAuth, signToken, verifyPassword } from '../lib/auth.js';

const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = registerSchema.parse(req.body);

  const [existing] = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await hashPassword(password);
  const [user] = await query<UserRow>(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, passwordHash, name ?? null],
  );

  res.status(201).json({ token: signToken(user.id), user: toUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const [user] = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user.id), user: toUser(user) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const [user] = await query<UserRow>('SELECT * FROM users WHERE id = $1', [req.userId]);
  if (!user) throw new HttpError(401, 'Invalid or expired token');
  res.json(toUser(user));
});
