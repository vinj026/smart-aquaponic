# Dashboard Aquaponic

Real-time monitoring dashboard untuk sistem aquaponic. Menampilkan data sensor (pH, TDS, turbidity, water level), status kesehatan sistem, dan insight otomatis.

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Edge Functions**: Supabase Edge Functions (Deno)


## Setup

### Install dependencies

```bash
cd apps/web && npm install
```

### Environment variables

Copy `.env.example` ke `.env` di folder `apps/web` dan isi dengan kredensial Supabase yang sesuai.

### Run development

Frontend:
```bash
cd apps/web
npm run dev
```

### Simulation

Data sensor digenerate secara otomatis melalui Supabase Edge Functions.


