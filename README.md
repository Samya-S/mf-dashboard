# MFAPI Mutual Fund Dashboard

A Next.js dashboard for exploring Indian mutual fund schemes and NAV trends using MFAPI.

## Overview

This app integrates all major MFAPI endpoints and provides:

- searchable mutual fund schemes
- top scheme listing (currently first 100 via `limit=100&offset=6`)
- latest NAV snapshot
- latest NAV date shown alongside the Latest NAV stat label
- historical NAV trend chart with date presets
- quick performance stats (absolute and percentage change)
- bookmark/unbookmark schemes with local persistence and prioritized list display

Reference API documentation: [MFAPI Docs](https://www.mfapi.in/docs/)

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Recharts for NAV graph visualization

## API Endpoints Used

The app proxies external API calls through internal routes:

- `GET /api/mf/list` -> MFAPI `GET /mf`
- `GET /api/mf/search` -> MFAPI `GET /mf/search?q=...`
- `GET /api/mf/[schemeCode]` -> MFAPI `GET /mf/{scheme_code}`
- `GET /api/mf/[schemeCode]/latest` -> MFAPI `GET /mf/{scheme_code}/latest`

## Rate Limiting and Caching

MFAPI has rate limiting guidance. To reduce repeated requests, the frontend uses an in-memory cache with request deduplication:

- list cache TTL: `60m`
- search cache TTL: `10m`
- history cache TTL: `30m`
- latest NAV cache TTL: `5m`

This behavior is implemented in `lib/client-cache.ts` and used by `hooks/use-mf-dashboard.ts`.

## Project Structure

- `app/page.tsx` - page composition
- `hooks/use-mf-dashboard.ts` - dashboard state + data fetching
- `components/dashboard/*` - UI subcomponents
- `lib/dashboard-utils.ts` - date/range/formatting helpers
- `lib/client-cache.ts` - client cache + in-flight request deduping
- `lib/mfapi.ts` - typed MFAPI service helpers
- `app/api/mf/*` - internal API route handlers

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run build
```
