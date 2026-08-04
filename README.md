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
| CI | GitHub Actions (lint, unit tests, build, Playwright E2E) | GitHub |

## Features

- Job listings with cards (company logo, salary, technologies, level, work mode, relative date) and infinite scroll (cursor-based pagination, no duplicates on load more)
- Search and filters (location, work mode, salary range, technologies, level, sort) synced with the URL, search bar in the header (desktop center, mobile own row)
- Job detail pages with "Apply" link
- Company pages (`/companies/:slug`) with logo, description and job listings; company name is a link from job cards/details; pages are prerendered (SEO)
- User accounts: registration/login with bcrypt + JWT (7d), `/login`, `/register`
- Favorites on the server (heart button, count badge in header, `/favorites` page, guarded)
- Application tracking: "Apply" creates an application, statuses (`applied` / `interview` / `offer` / `rejected`) editable with a history timeline on `/applications`
- Dark mode toggle (sun/moon in the header) with persistence in `localStorage` and auto-detect from `prefers-color-scheme` (no FOUC)
- Full-width, responsive layout

## Structure

```
src/app/
  core/           # services (jobs, favorites, applications, auth, companies, theme), models, guards, interceptors, resolvers
  shared/         # reusable components (job-card, search-bar, favorite-button...)
  features/
    jobs/         # list, filters, detail
    favorites/    # favorites page
    applications/ # application tracking page
    companies/    # company profile pages
    auth/         # login + register
  layouts/        # header, footer, main layout
e2e/              # Playwright E2E specs
.github/workflows/ci.yml   # GitHub Actions CI
backend/
  src/
    db/           # schema + connection
    routes/       # jobs, technologies, auth, favorites, applications, companies
    middleware/   # error handler
    lib/          # auth helpers (bcrypt, JWT, requireAuth)
    seed.ts       # seeds 22 sample jobs + companies
```

## Getting started

Prerequisites: Node.js >= 20, a PostgreSQL database (e.g. free [Neon](https://neon.tech) project).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # set DATABASE_URL, FRONTEND_URL, JWT_SECRET
npm run seed            # create tables + seed 22 jobs and companies
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
| GET | `/api/jobs` | List with filters + cursor pagination (`search`, `location`, `workMode`, `salaryMin`, `salaryMax`, `technologies`, `level`, `sort`, `cursor`, `limit`) → `{ data, nextCursor, hasMore }` |
| GET | `/api/jobs/:id` | Job detail (400 for invalid UUID, 404 if missing) |
| POST | `/api/jobs/batch` | Fetch jobs by `{ ids: string[] }` |
| GET | `/api/technologies` | Distinct technologies for filter chips |
| POST | `/api/auth/register` | Register (`{ email, password, name? }`) → `{ token, user }` (409 if email taken) |
| POST | `/api/auth/login` | Login (`{ email, password }`) → `{ token, user }` (401 on bad credentials) |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/favorites` | Favorite job ids (auth required) |
| POST | `/api/favorites` | Add favorite `{ jobId }` (auth required, 404 if job missing) |
| DELETE | `/api/favorites/:jobId` | Remove favorite (auth required) |
| GET | `/api/applications` | User applications with job info + status history (auth required) |
| POST | `/api/applications` | Create application `{ jobId }` (auth required, 409 if already applied) |
| PATCH | `/api/applications/:id` | Update status `{ status }` and append history event (auth required) |
| GET | `/api/companies` | Company list with open position counts |
| GET | `/api/companies/:id` | Company detail with its jobs (match by id or slug, 404 if missing) |

All private endpoints return `401` without a valid `Authorization: Bearer <token>` header.

## Testing

```bash
# Unit tests (vitest + Angular Testing Library) - services (jobs, favorites, auth) + components (job-card, search-bar, filters, favorite-button, favorites page)
npx ng test --watch=false

# E2E (Playwright) - expects backend on :4000 and frontend on :4200
npx playwright test
```

GitHub Actions runs formatting check, backend typecheck, unit tests, build and Playwright E2E (with a PostgreSQL service container) on every push to `main` and on every PR.

## Deployment

- **Vercel** — frontend (framework preset: Angular, `ng build --configuration production`, output `dist/job-board/browser`). Company pages are prerendered as static HTML (requires the API to be reachable during build; default `https://job-board-angular.onrender.com/api`, override with `API_URL`).
- **Render** — backend (root directory `backend`, start `node dist/index.js`). Env: `DATABASE_URL`, `FRONTEND_URL`, `JWT_SECRET`.
- **Neon** — managed PostgreSQL

## Project tracking

Planned and implemented via [GitHub Issues](https://github.com/apekul/job-board-angular/issues). Implemented: #14 auth + server favorites, #16 E2E + CI, #17 application tracking, #19 infinite scroll / cursor pagination, #20 dark mode, #21 company pages, #22 unit tests (services + components), #23 API hardening (rate limiting + cache). Remaining: #15 AI match, #18 job alerts.
