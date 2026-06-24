# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-15

### Changed

- **Build tool**: migrated from Create React App (`react-scripts@5.0.0`) to **Vite `^8.0.9`** with `@vitejs/plugin-react@^6.0.1`. `npm start` now runs `vite`; `npm run build` runs `tsc && vite build`. `index.html` moved to the repository root. (16217e4)
- **React 17 → 18**: bumped `react` and `react-dom` to `^18.3.1`; updated `@types/react` 17 → 18 and `@types/react-dom` 17 → 18; aligned `@testing-library/react` to `^16.3.2`. (b2c5d61, e78e995, 0f64235)
- **RJSF 4 → 5**: `@rjsf/core` `^4.2.0` → `^5.24.13`; `@rjsf/material-ui` replaced with `@rjsf/mui@^5.24.13`; added `@rjsf/validator-ajv8@^5.24.13` as a required peer dependency. (0f64235)
- **Material UI**: `@mui/icons-material` `^5.8.4` → `^5.18.0`; `@mui/material` aligned to `^5.18.0`; `@mui/styles` realigned from `^6.4.8` back to `^5.18.0` for v5 consistency. (e78e995)
- **Swagger UI**: `swagger-ui-react` `5.10.5` → `5.32.4`. (e78e995)
- **Leaflet stack**: `react-leaflet` `^3.2.5` → `^4.2.1`; refreshed `leaflet` lockfile entries. (0f64235, 6995ad3)

### Fixed

- **Vite dev-server blank-page regression** (`init_emotion_react_..._esm is not defined`): re-introduced `package-lock.json` into the Docker build (removed from `.dockerignore`), switched `Dockerfile-dev` from `npm install` to `npm ci` so Vite stays pinned to the locked `8.0.9`, and added `resolve.dedupe` + `optimizeDeps.include` entries for `@emotion/react`, `@emotion/styled`, `@mui/material`, `react`, and `react-dom` in `vite.config.ts`. (2bbd5aa)
- **Portainer 2.18+ edge stack status** (`src/components/applications/List.tsx`): edge stacks now read their current stage from `endpointStatus.Status[]` (the array of stage transitions) instead of the deprecated top-level `endpointStatus.Type`, which Portainer 2.18+ leaves at `Pending` indefinitely. Introduced explicit status-code constants (`RUNNING = 7`, `ERROR = 2`) matching the new Portainer status enum; error messages are now sourced from the latest `Error` entry in the stages array. (84be183)
- Removed leftover `console.log` debug calls from `src/pages/DataManagement.tsx`, `src/pages/ModelManagement.tsx` (EDC connector info fetch), and `src/contexts/CvatClient.ts` (CVAT auth cookie / local-storage / login flow). (ea93a77, c7d4740)

### Removed

- Dropped `react-scripts`, `@testing-library/jest-dom`, `@types/jest`, and `@types/node` from `devDependencies` as part of the Vite migration. (16217e4)
