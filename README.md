# Relay — Workflow & decisions

A single-screen **operations workspace** demo: a filterable team queue, inline table edits, a detail drawer, and a lightweight **New item** intake flow. Built to feel like a calm internal tool—not a ticket system.

**Live:** deploy to [Vercel](https://vercel.com/new) (or any Next.js host) from this repo.

## Stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Mantine** (layout, table, forms, modal, drawer, dates)
- **Font Awesome** (icons)
- **Client-only state** — mock data in `lib/`; no API (easy to swap for a backend later)

## What to try

1. **Search** (header + mobile toolbar) and **filters** (status, owner, mine-only, activity day).
2. **Sort** by updated time, priority, or due date.
3. **Edit** status, owner, priority, and due date **inline** in the table.
4. Open a row for the **drawer** (summary, activity, notes, status change).
5. **New item** — add a row; it appears at the top with a short highlight and a system activity entry.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production check
```

## Project layout

| Area | Location |
|------|-----------|
| Main shell & page | `components/relay-workspace.tsx` |
| Table editors | `components/relay-table-inline-fields.tsx` |
| Detail drawer | `components/detail-drawer.tsx` |
| New item modal | `components/new-item-modal.tsx` |
| Types & mock data | `lib/types.ts`, `lib/mock-data.ts` |
| Design tokens | `app/globals.css`, `app/theme.ts` |

---

Bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
