import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { jobsRouter } from './routes/jobs.js';
import { technologiesRouter } from './routes/technologies.js';
import { authRouter } from './routes/auth.js';
import { favoritesRouter } from './routes/favorites.js';
import { applicationsRouter } from './routes/applications.js';
import { companiesRouter } from './routes/companies.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const FRONTEND_URL = process.env.FRONTEND_URL;

app.set('trust proxy', 1);

app.use(
  cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(',') : '*',
  }),
);
app.use(express.json());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', status: 429 },
});

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', status: 429 },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/companies', companiesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', status: 404 });
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Job Board API listening on http://localhost:${PORT}`);
});
