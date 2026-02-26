# BALLISTiQ Admin Dashboard

Standalone React frontend for the BALLISTiQ admin panel. Only users with role `ROLE_ADMIN` or `ROLE_USER_ADMIN` can access the dashboard.

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
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set the backend base URL:
   ```
   VITE_API_BASE_URL=https://api.ballistiq.xyz
   ```
   (No trailing slash. Use the URL where your Spring Boot backend is running.)

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
| `VITE_API_BASE_URL` | Base URL of the BALLISTiQ backend API (default: `https://api.ballistiq.xyz`) |

## Features

- **Login**: Email + password. Only accounts with admin role can proceed; others see "Access denied".
- **Users**: Paginated, sortable, filterable table (search, A–Z filter). Per-row "Send notification".
- **User Locations Map**: Leaflet map with pins; filters for date range, locale, user ID, limit.
- **Notifications**: Send by locale (dropdown from backend); single-user send from the Users page.

## Backend requirements

The backend must expose:

- `POST /api/authenticate/sign-in` — login (body: `emailAddress`, `password`); response includes `data.token` and `data.userInfo.roles`.
- `GET /api/authenticate/user-info` — current user (with `roles`); used after login.
- `GET /admin/api/users` — paginated users (query: `page`, `size`, `sortBy`, `sortDir`, `startsWith`, `q`).
- `GET /admin/api/user-locations` — location points for the map.
- `GET /admin/api/locales` — list of locale codes.
- `POST /admin/api/notifications/user` — send notification to one user.
- `POST /admin/api/notifications/locale` — send notification by locale.
- `POST /admin/api/bullets` — create bullet (AdminRestController).
- `GET /admin/api/caliber-diameter` — list caliber diameters (AdminRestController).

All admin endpoints require `Authorization: Bearer <token>` and a user with `ROLE_ADMIN` or `ROLE_USER_ADMIN`.
