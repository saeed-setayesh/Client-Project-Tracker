# Client & Project Tracker

![CI](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)

A full-stack agency tool for managing clients, projects, tasks, and time — with role-based access for admins, team members, and clients.

## Features

- **Multi-tenant organizations** — each agency gets its own workspace
- **Three permission levels** — Admin, Team Member, Client (read-only project view)
- **Kanban task board** — drag-and-drop with @dnd-kit
- **Budget vs. actual tracking** — progress bar turns red when over budget
- **Time entries** — billable hours logged per task with hourly rates
- **Comments** — internal notes hidden from client users
- **Team invitations** — admin invites members and clients via link
- **Seed script** — realistic demo data in 30 seconds

## Tech Stack

- **Next.js 15** (App Router) — full-stack React framework
- **PostgreSQL** — relational database
- **Drizzle ORM** — type-safe database access
- **Tailwind CSS 4** — glassmorphism UI
- **Auth.js v5** — credentials-based authentication
- **Vitest** — unit tests
- **GitHub Actions** — CI on every push

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL running locally

### Setup

```bash
# Create the database
createdb client_project_tracker

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and AUTH_SECRET

# Push schema to database
npm run db:push

# Seed with demo data
npm run seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.test | password123 |
| Team | sarah@acme.test | password123 |
| Client | john@techstart.com | password123 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run seed` | Populate database with demo data |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── app/           # Next.js pages and layouts
├── actions/       # Server Actions
├── components/    # React components
├── db/            # Drizzle schema and client
└── lib/           # Auth, permissions, utilities
```

## License

MIT
