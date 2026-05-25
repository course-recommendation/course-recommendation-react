# Copilot instructions

## Build and lint
- `bun run build` (runs `tsc -b` then `vite build`)
- `bun run lint`

## Architecture
- **Entry + providers:** `src/main.tsx` bootstraps the app with Ant Design `ConfigProvider`, ProComponents `ProConfigProvider`, and `StyleProvider`, then renders `RouterProvider`.
- **Routing + auth flow:** `src/router.tsx` defines nested routes: `/public-path/*` for login/register and a root tree gated by `AuthenticateChecking` (localStorage token), then `Authenticated` (fetches `/me` and `/me/first-login`), then `AuthenticatedStatsig` (Statsig client + `MeContext`), then `AppHeader` and feature pages.
- **State/contexts:** `Root.tsx` provides `AlgorithmContext` from localStorage; `AuthenticatedStatsig` provides `MeContext` (user + first-login flag) to downstream routes.
- **Data layer:** `src/common/services/defaultAxios.ts` configures axios with `VITE_BACKEND_URL`, auth header, and `{ ok: true|false }` response handling that throws `RestError`. API hooks (e.g., `src/common/hooks/network/useGet.ts`) are used by API modules in `src/api`.

## Key conventions
- Use `@/` path alias for `src` imports (Vite + TS paths).
- Network responses are expected to be `{ ok: true, data }` or `{ ok: false, errorCode, errorData }`; `defaultAxios` throws `RestError` on failures and hooks expect that behavior.
- Authentication and algorithm choice are stored in localStorage via `LocalStorageKey`; the algorithm is provided through `AlgorithmContext`.
- Styling mixes Ant Design/Pro components with Tailwind v4 layers configured in `src/index.css`.
