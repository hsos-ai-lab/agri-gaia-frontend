<!--
SPDX-FileCopyrightText: 2024 Osnabrück University of Applied Sciences
SPDX-FileContributor: Andreas Schliebitz
SPDX-FileContributor: Henri Graf
SPDX-FileContributor: Jonas Tüpker
SPDX-FileContributor: Lukas Hesse
SPDX-FileContributor: Maik Fruhner
SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
SPDX-FileContributor: Tobias Wamhof

SPDX-License-Identifier: MIT
-->

<div align="center">

<img src="https://raw.githubusercontent.com/hsos-ai-lab/agri-gaia-platform/main/services/keycloak/themes/agrigaia/login/resources/img/raw/agri-gaia-fulllogo.png" alt="Agri-Gaia logo" width="360">

# Agri-Gaia Frontend

**The web client of the Agri-Gaia platform, powered by React and Material UI.**

[![Release](https://img.shields.io/badge/release-1.0.0-2e7d32)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[Features](#-features) ·
[Configuration](#-configuration) ·
[Development](#-development) ·
[Troubleshooting](#-troubleshooting)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Configuration](#-configuration)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Related Repositories](#-related-repositories)
- [Changelog](#-changelog)
- [License](#-license)

## 🌱 Overview

This repository contains the single-page web application of the [Agri-Gaia platform](https://github.com/hsos-ai-lab/agri-gaia-platform). Users sign in through Keycloak and work with the platform's datasets, models, training jobs, container images and edge devices. The frontend communicates exclusively with the [Agri-Gaia backend](https://github.com/hsos-ai-lab/agri-gaia-backend) REST API and links to the integrated platform tools.

> [!NOTE]
> This repository is included as a git submodule at `services/frontend` of the [agri-gaia-platform](https://github.com/hsos-ai-lab/agri-gaia-platform) repository. It requires a running platform (Keycloak and backend) and is served at `https://app.<PROJECT_BASE_URL>`.

## ✨ Features

| Area | Description |
|------|-------------|
| **Datasets** | Upload, describe, search, annotate (CVAT) and convert datasets |
| **Model Training** | Configure and run training containers using forms generated from JSON Schema, follow logs and scores, and export models to ONNX |
| **Models** | Upload, inspect and publish trained models |
| **Container Templates** | Manage inference container templates from ZIP archives or Git repositories |
| **Container Registry** | Browse the platform's Docker registry and build inference images |
| **Edge Devices & Groups** | Register edge devices and deploy models and containers to them |
| **Applications** | Deploy multi-container applications to edge groups |
| **Integrated Services** | Integrate and invoke external services described by OpenAPI specifications |
| **Network** | Manage Eclipse Dataspace Connector connections, catalogs and transfers |
| **Licenses** | Review third-party licenses of the platform |

The side navigation also links to the integrated platform tools: JupyterHub notebooks, the MinIO object store, the Fuseki triple store, WebVOWL ontologies, Portainer and the Grafana monitoring dashboards.

## 🧰 Tech Stack

| Area | Technologies |
|------|--------------|
| Framework | React 18.3, TypeScript |
| Build tooling | Vite 8 with `@vitejs/plugin-react` |
| UI | Material UI 5, MUI Lab, MUI X Tree View |
| Authentication | `keycloak-js` 24 |
| Forms | React JSON Schema Form 5 (`@rjsf/mui`, AJV 8 validator) |
| Visualization | Recharts, Leaflet / React Leaflet, Swagger UI, CodeMirror |
| Routing | React Router 6 |
| State | React Context (`src/contexts`) |
| Runtime | Node.js 20 (Alpine) |

## 🔧 Configuration

| Setting | Location | Description |
|---------|----------|-------------|
| Keycloak client | [`public/keycloak.json`](public/keycloak.json) | Realm, server URL and public client ID (`frontend`) |
| API host | [`src/api.ts`](src/api.ts) | Requests are sent to `https://api.<PROJECT_BASE_URL>`. The default base URL is `agri-gaia.localhost` |
| `PROJECT_BASE_URL` | Docker build argument | Replaces `agri-gaia.localhost` in the production bundle and in `keycloak.json` |
| `KEYCLOAK_REALM_NAME` | Docker build argument | Replaces the default realm `test-realm` in `keycloak.json` |
| `VITE_PORTAINER_VERSION` | Docker build argument (**required**) | Portainer version used to generate the edge agent installation command |

> [!NOTE]
> The base URL is replaced at **build time**, not at runtime. When the platform is deployed with the [deployment scripts](https://github.com/hsos-ai-lab/agri-gaia-platform-deployment), the base URL is also rewritten in `src/`, `public/keycloak.json` and `vite.config.ts`.

## 💻 Development

### Running within the platform

The recommended way to develop the frontend is inside the platform's Docker Compose stack (see the [platform README](https://github.com/hsos-ai-lab/agri-gaia-platform#-getting-started)). In development mode, the platform's `docker-compose.override.yml`:

- builds the image from [`Dockerfile-dev`](Dockerfile-dev);
- bind-mounts `src/` and `public/` into the container;
- starts the Vite development server on port `80` with hot module replacement.

The application is then available at [app.agri-gaia.localhost](https://app.agri-gaia.localhost).

### Available scripts

Install the dependencies with `npm ci`, then use:

| Command | Description |
|---------|-------------|
| `npm start` | Starts the Vite development server |
| `npm run build` | Type-checks the project (`tsc`) and creates a production build in `dist/` |
| `npm run serve` | Serves the production build locally (`vite preview`) |
| `npm run lint` | Lints and auto-fixes all `.ts` and `.tsx` files with ESLint |

### Production image

The [`Dockerfile`](Dockerfile):

1. builds the application with `npm ci` and `npm run build`;
2. applies the base URL and realm replacements described in [Configuration](#-configuration);
3. serves the static bundle with [`serve`](https://github.com/vercel/serve) on port `80`.

### Code style

| Tool | Configuration |
|------|---------------|
| ESLint | [`.eslintrc.js`](.eslintrc.js): `eslint:recommended`, `@typescript-eslint/recommended`, `prettier` |
| Prettier | [`.prettierrc.js`](.prettierrc.js): 4-space indentation, single quotes, trailing commas, 120-character lines |

## 🩺 Troubleshooting

### Update npm packages (workaround)

`npm update` installs newer versions within the declared ranges but does not update `package.json`. The following command updates all packages and then rewrites every caret (`^`) range in `dependencies` and `devDependencies` to the newly resolved version:

```bash
npm update && npm list --json | jq --slurpfile package package.json 'def replaceVersion($replacements): with_entries(if .value | startswith("^") then .value = ("^" + $replacements[.key].version) else . end); .dependencies as $resolved | reduce ["dependencies", "devDependencies"][] as $deps ($package[0]; if .[$deps] | type == "object" then .[$deps] |= replaceVersion($resolved) else . end)' > package.json~ && mv package.json~ package.json && npm install
```

> [!IMPORTANT]
> - [`jq`](https://jqlang.github.io/jq/) must be installed on your system.
> - Exactly pinned dependencies (for example `vite`) are left untouched on purpose.
> - Both Dockerfiles install dependencies with `npm ci`. Always commit the updated `package-lock.json` together with `package.json`, otherwise the image build will fail.

## 📁 Project Structure

```text
agri-gaia-frontend/
├── public/
│   └── keycloak.json      # Keycloak client configuration
├── src/
│   ├── App.tsx            # Providers and route definitions
│   ├── api.ts             # Authenticated fetch wrapper for the backend API
│   ├── endpoints.ts       # Backend endpoint constants
│   ├── pages/             # Route-level pages
│   ├── components/        # Feature components (datamanagement, train, models, edge, ...)
│   ├── contexts/          # React contexts (Keycloak, CVAT, background tasks, theme)
│   ├── types/             # TypeScript interfaces
│   ├── style/             # Theme and styles
│   └── imgs/              # Logos and images
├── index.html             # Vite entry HTML
├── vite.config.ts
├── Dockerfile             # Production image
└── Dockerfile-dev         # Development image
```

## 🔗 Related Repositories

| Repository | Description |
|------------|-------------|
| [agri-gaia-platform](https://github.com/hsos-ai-lab/agri-gaia-platform) | Docker Compose platform definition |
| [agri-gaia-backend](https://github.com/hsos-ai-lab/agri-gaia-backend) | FastAPI backend |
| [agri-gaia-frontend](https://github.com/hsos-ai-lab/agri-gaia-frontend) | React frontend (this repository) |
| [agri-gaia-platform-deployment](https://github.com/hsos-ai-lab/agri-gaia-platform-deployment) | Scripts for automated production deployments |
| [agri-gaia-train-container-template](https://github.com/hsos-ai-lab/agri-gaia-train-container-template) | Template for custom model training containers |
| [agri-gaia-inference-container-template](https://github.com/hsos-ai-lab/agri-gaia-inference-container-template) | Template for custom inference containers |

## 📝 Changelog

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright © 2024 Osnabrück University of Applied Sciences.

**Contributors:** Andreas Schliebitz, Henri Graf, Jonas Tüpker, Lukas Hesse, Maik Fruhner, Prof. Dr.-Ing. Heiko Tapken, Tobias Wamhof
