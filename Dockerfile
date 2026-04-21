# SPDX-FileCopyrightText: 2024 Osnabrück University of Applied Sciences
# SPDX-FileContributor: Andreas Schliebitz
# SPDX-FileContributor: Henri Graf
# SPDX-FileContributor: Jonas Tüpker
# SPDX-FileContributor: Lukas Hesse
# SPDX-FileContributor: Maik Fruhner
# SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
# SPDX-FileContributor: Tobias Wamhof
#
# SPDX-License-Identifier: MIT

FROM node:16-alpine

ARG PROJECT_BASE_URL
ARG KEYCLOAK_REALM_NAME
ARG VITE_PORTAINER_VERSION

RUN test -n "$VITE_PORTAINER_VERSION"

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install -g serve && npm install

COPY . ./
RUN npm run build

# replace all occurrences of the default hostname with the .env value
# inside the app's JavaScript and configure the keycloak.json
RUN sed -i "s/agri-gaia.localhost/${PROJECT_BASE_URL}/g" build/static/js/main.*.js && \
    sed -i "s/agri-gaia.localhost/${PROJECT_BASE_URL}/g; \
    s/test-realm/${KEYCLOAK_REALM_NAME}/g \
    " build/keycloak.json

EXPOSE 80
ENTRYPOINT ["serve", "-s", "build", "-l", "80"]
