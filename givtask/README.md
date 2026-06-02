# GivTask Frontend

**GivTask** — Connecting NGOs with Skilled Volunteers and Freelancers.

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Start development server (requires backend running on port 5000)
npm run dev

# Production build
npm run build
```

## Environment Variables

| Variable             | Default                        | Description              |
|----------------------|-------------------------------|--------------------------|
| `VITE_API_BASE_URL`  | `http://127.0.0.1:5000`       | Flask backend URL        |

Create `.env.local` for local overrides (already exists).

## Demo Accounts

| Role       | Email                    | Password  |
|------------|--------------------------|-----------|
| Volunteer  | volunteer@demo.com       | demo1234  |
| Freelancer | freelancer@demo.com      | demo1234  |
| NGO        | ngo@edureach.com         | demo1234  |
| Admin      | admin@givtask.com        | admin123  |

## Deployment — Vercel

1. Push project to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_BASE_URL` = your Render backend URL
4. Deploy — `vercel.json` handles SPA routing automatically

## Backend

See `../givtask-backend/README.md` for backend setup and Render deployment.
