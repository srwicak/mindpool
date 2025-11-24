# Startup Workshop App

A real-time collaboration tool for startup workshops, built with **Next.js**, **Supabase**, and **Tailwind CSS**.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Realtime**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ installed.
- A [Supabase](https://supabase.com/) account.

## Setup Instructions

### 1. Create Supabase Project

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2.  Once created, go to **Project Settings** -> **API**.
3.  Copy the `URL` and `anon` public key.

### 2. Database Setup

1.  Go to the **SQL Editor** in your Supabase dashboard.
2.  Copy the content of `schema.sql` from this repository.
3.  Paste it into the SQL Editor and run it.
    - This will create the `sessions`, `boards`, and `notes` tables.
    - It will also enable Realtime for the `notes` table and set up simple RLS policies.

### 3. Environment Variables

Create a `.env.local` file in the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

1.  Push this code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and import the project.
3.  In the **Environment Variables** section of the deployment settings, add:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4.  Click **Deploy**.

## Features

- **Sessions**: Create workshop sessions (e.g., "Week 1").
- **Boards**: Each session automatically gets 5 boards (Gojek, Siklus, SWAP Energi, Better Place, My Startup).
- **Real-time Notes**: Add notes to CX, GTM, or SPRINT columns. Everyone sees them instantly.
- **Facilitator Mode**: Toggle "Facilitator Mode" (Settings icon) to highlight important notes.
- **Identity**: Simple display name system (stored in browser).

## License

MIT
