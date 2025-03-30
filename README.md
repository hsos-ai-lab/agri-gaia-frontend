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

# Agri-Gaia Frontend

The Webclient for Agri-Gaia powered by React and MaterialUI.

## Troubleshooting

### Update npm packages (workaround)

```bash
npm update && npm list --json | jq --slurpfile package package.json 'def replaceVersion($replacements): with_entries(if .value | startswith("^") then .value = ("^" + $replacements[.key].version) else . end); .dependencies as $resolved | reduce ["dependencies", "devDependencies"][] as $deps ($package[0]; if .[$deps] | type == "object" then .[$deps] |= replaceVersion($resolved) else . end)' > package.json~ && mv package.json~ package.json && npm install
```
