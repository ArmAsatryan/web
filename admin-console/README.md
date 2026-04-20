# BALLISTiQ Admin Dashboard

Standalone React frontend for the BALLISTiQ admin panel. Only users with role `ROLE_ADMIN` or `ROLE_USER_ADMIN` can access the dashboard.

### Repository layout (this package)

| Path | Purpose |
|------|---------|
| `src/` | Admin Console app. |
| `src/pages/` | Top-level pages (Dashboard, Users, Map, Notifications, Assistant detections, etc.). |
| `src/features/assistant-detections/` | Assistant detections UI (list, detail, image canvas, metadata panel). |
| `src/api/detectionsApi.ts` | HTTP client for `/api/images/target` and related endpoints. |
| `src/api/api.ts` | Shared Axios client and admin endpoints. |

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Material UI (MUI)** for components
- **TanStack Query** for server state
- **React Router** for routing
- **Axios** for API client
- **Leaflet** (react-leaflet) for the user locations map

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:

   Sensible defaults are committed per mode — you usually don't need to touch anything:

   | File | Mode | `VITE_API_BASE_URL` |
   |------|------|---------------------|
   | `.env.development` | `npm run dev` | `http://192.168.1.25:8080` |
   | `.env.production`  | `npm run build` | `https://api.ballistiq.xyz` |

   To override on your machine (e.g. point to a different local backend), copy `.env.example` to `.env` (gitignored):
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```
   (No trailing slash. Values in `.env` take precedence over `.env.development` / `.env.production`.)

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open the URL shown (e.g. http://localhost:5173).

## Building for production

```bash
npm run build
```

Output is in `dist/`. Serve with any static file server and point it to your backend for API calls (or use the same host with a reverse proxy).

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the BALLISTiQ backend API. Dev default: `http://192.168.1.25:8080` (`.env.development`). Prod default: `https://api.ballistiq.xyz` (`.env.production`). |

## Features

- **Login**: Email + password. Only accounts with admin role can proceed; others see "Access denied".
- **Users**: Paginated, sortable, filterable table (search, A–Z filter). Per-row "Send notification".
- **User Locations Map**: Leaflet map with pins; filters for date range, locale, user ID, limit.
- **Notifications**: Send by locale (dropdown from backend); single-user send from the Users page; multi-language batch and history.
- **Assistant detections**: Standalone sidebar page listed directly below **Notifications**. Browse users who have target-image rows (paginated), open per-user detection viewer with image overlays and metadata. Uses the same admin JWT as other API calls (`src/api/detectionsApi.ts` → `/api/images/target`, `/api/images/target/users`, deletes). If these endpoints return **403**, ensure BallisticBE allows admin roles for those paths.

## Backend requirements

The backend must expose:

- `POST /api/authenticate/sign-in` — login (body: `emailAddress`, `password`); response includes `data.token` and `data.userInfo.roles`.
- `GET /api/authenticate/user-info` — current user (with `roles`); used after login.
- `GET /admin/api/users` — paginated users (query: `page`, `size`, `sortBy`, `sortDir`, `startsWith`, `q`).
- `GET /admin/api/user-locations` — location points for the map.
- `GET /admin/api/locales` — list of locale codes.
- `POST /admin/api/notifications/user` — send notification to one user.
- `POST /admin/api/notifications/language` — send notification by language (FCM token language).
- `POST /admin/api/bullets` — create bullet (AdminRestController).
- `GET /admin/api/caliber-diameter` — list caliber diameters (AdminRestController).

All admin endpoints require `Authorization: Bearer <token>` and a user with `ROLE_ADMIN` or `ROLE_USER_ADMIN`.
