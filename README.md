# Dashboard Aquaponic

Real-time monitoring dashboard untuk sistem aquaponic. Menampilkan data sensor (pH, TDS, turbidity, water level), status kesehatan sistem, dan insight otomatis.

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL + Realtime)
- **Edge Functions**: Supabase Edge Functions (Deno)

## Project Structure

```
apps/
  web/        # Nuxt frontend dashboard
  api/        # Express backend API
supabase/
  functions/  # Edge functions
  migrations/ # Database migrations
docs/         # PRD, architecture, testing docs
```

## Setup

### Install dependencies

```bash
cd apps/web && npm install
cd apps/api && npm install
```

### Environment variables

Copy `.env.example` ke `.env` di masing-masing folder (`apps/web`, `apps/api`) dan isi dengan kredensial yang sesuai.

### Run development

Frontend:
```bash
cd apps/web
npm run dev
```

Backend:
```bash
cd apps/api
npm run dev
```

## Branch Strategy

- `main` — production
- `dev` — active development
- `feat/*` — feature branches

Commit menggunakan [Conventional Commits](https://www.conventionalcommits.org/).
