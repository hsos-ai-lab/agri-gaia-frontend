# SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
# SPDX-FileContributor: Andreas Schliebitz
# SPDX-FileContributor: Henri Graf
# SPDX-FileContributor: Jonas Tüpker
# SPDX-FileContributor: Lukas Hesse
# SPDX-FileContributor: Maik Fruhner
# SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
# SPDX-FileContributor: Tobias Wamhof
#
# SPDX-License-Identifier: AGPL-3.0-or-later

FROM node:22-alpine

ARG PROJECT_BASE_URL="agri-gaia.localhost"
ARG KEYCLOAK_REALM_NAME="default"
ARG REACT_APP_PORTAINER_VERSION

RUN test -n "${REACT_APP_PORTAINER_VERSION}"

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install -g serve
RUN npm install

COPY . ./
RUN npm run build

RUN sed -i "s/agri-gaia.localhost/${PROJECT_BASE_URL}/g" build/static/js/main.*.js

RUN sed -i "s/agri-gaia.localhost/${PROJECT_BASE_URL}/g; \
    s/default-realm/${KEYCLOAK_REALM_NAME}/g \
    " build/keycloak.json

EXPOSE 80
ENTRYPOINT ["serve", "-s", "build", "-l", "80"]
