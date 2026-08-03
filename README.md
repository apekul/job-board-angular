# Job Board

A job board app inspired by JustJoinIT. Full-stack project: Angular + TailwindCSS frontend, Express API backend, PostgreSQL database (Neon).

## Live demo

- Frontend: https://job-board-angular.vercel.app/jobs
- API: https://job-board-angular.onrender.com

## Stack

| Layer | Tech | Hosting |
|---|---|---|
| Frontend | Angular 21 (standalone, Signals, static prerendering) + TailwindCSS | Vercel |
| Backend | Node.js + Express + TypeScript | Render |
| Database | PostgreSQL | Neon |

## Features

- Job listings with cards (company logo, salary, technologies, level, work mode, relative date)
- Search and filters (location, work mode, salary range, technologies, level, sort) synced with the URL
- Job detail pages with "Apply" link
- Favorites saved to `localStorage` (heart button, count badge in header, `/favorites` page)
- Full-width, responsive layout

## Structure

```
src/app/
  core/           # services (jobs, favorites), models
  shared/         # reusable components (job-card, search-bar, filters button...)
  features/
    jobs/         # list, filters, detail
    favorites/    # favorites page
  layouts/        # header, footer, main layout
backend/
  src/
    db/           # schema + connection
    routes/       # jobs, technologies
    middleware/   # error handler
    seed.ts       # seeds 22 sample jobs
```

## Getting started

Prerequisites: Node.js >= 20, a PostgreSQL database (e.g. free [Neon](https://neon.tech) project).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # set DATABASE_URL, FRONTEND_URL
npm run seed            # create table + seed 22 jobs
npm run dev             # http://localhost:4000
```

### 2. Frontend

```bash
npm install
npm start               # http://localhost:4200
```

The frontend expects the API at `http://localhost:4000/api` (configurable in `src/environments/`).

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List with filters + pagination (`search`, `location`, `workMode`, `salaryMin`, `salaryMax`, `technologies`, `level`, `sort`, `page`, `limit`) |
| GET | `/api/jobs/:id` | Job detail (400 for invalid UUID, 404 if missing) |
| POST | `/api/jobs/batch` | Fetch jobs by `{ ids: string[] }` |
| GET | `/api/technologies` | Distinct technologies for filter chips |

## Deployment

- **Vercel** — frontend (framework preset: Angular, `ng build --configuration production`, output `dist/job-board/browser`)
- **Render** — backend (root directory `backend`, start `node dist/index.js`)
- **Neon** — managed PostgreSQL

## Project tracking

Planned and implemented via [GitHub Issues](https://github.com/apekul/job-board-angular/issues) (epic #1 with sub-issues). All issues are closed — the project is complete.
