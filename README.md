# MediPillar v2

Clean rebuild of the MediPillar medicine catalog — **same UI**, new project folder, Supabase backend.

> Your old project stays in `../server`. This folder is the new app.

## Folder structure

```
medipillar-v2/
├── client/                 # React + TypeScript + Tailwind
│   ├── index.html
│   └── src/
│       ├── app/            # App shell, routes, providers
│       ├── components/     # Shared UI (Navigation, Footer, shadcn)
│       ├── pages/          # Public + admin pages (same design as v1)
│       ├── hooks/
│       └── lib/            # Supabase client, API helpers
├── server/                 # Express API + Supabase service role
├── shared/
│   ├── schema.ts           # Zod / validation (API contracts)
│   └── types/              # Database + catalog types
├── supabase/migrations/    # PostgreSQL schema + RLS
├── attached_assets/        # Images (hero, logos)
├── package.json
├── vite.config.ts
└── env.example
```

## Quick start

1. Copy `env.example` → `.env` and fill Supabase + admin credentials.
2. Run SQL in `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor.
3. Enable **Phone** auth in Supabase dashboard.

```bash
cd medipillar-v2
npm install
npm run dev
```

Open **http://localhost:5000**

## Auth

| Role | Method |
|------|--------|
| **User** | Name + phone + optional email → Supabase SMS OTP |
| **Admin** | `/admin` → `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (API + Vite) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run check` | TypeScript check |

## Notes

- UI components and pages were copied from the legacy app so the look stays the same.
- Data layer uses **Supabase PostgreSQL** (not MongoDB).
- Legacy fields (`mgo`, `qty`, etc.) are optional in `shared/types/catalog.ts` for UI compatibility.
