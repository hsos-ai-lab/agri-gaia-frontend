// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import Keycloak from 'keycloak-js';

const KeycloakContext = createContext<Keycloak.KeycloakInstance | undefined>(undefined);

export const KeycloakProvider = function ({ children }: { children: ReactNode }) {
    const [keycloak, setKeycloak] = useState<Keycloak.KeycloakInstance | undefined>(undefined);

    function storeTokens(kc: Keycloak.KeycloakInstance) {
        if (kc?.token) {
            sessionStorage.setItem('kc_token', kc?.token);
        }
        if (kc?.refreshToken) {
            sessionStorage.setItem('kc_refresh_token', kc?.refreshToken);
        }
    }

    async function initKeycloak() {
        const token = sessionStorage.getItem('kc_token');
        const refreshToken = sessionStorage.getItem('kc_refresh_token');

        const kcInitOptions = {
            onLoad: 'login-required' as Keycloak.KeycloakOnLoad,
            token: token || undefined,
            refreshToken: refreshToken || undefined,
        };

        // initialize the keycloak adapter
        const kc = new Keycloak('/keycloak.json');
        await kc.init(kcInitOptions);

        // TODO: isTokenExpired does not always give the correct answer,
        // because of missing timeSkew
        if (kc.isTokenExpired()) {
            const refreshed = await kc.updateToken(0);
            if (refreshed) {
                console.log('Access Token refreshed!');
            } else {
                console.log('Access Token is still valid!');
            }
        }

        storeTokens(kc);
        setKeycloak(kc);
    }

    useEffect(() => {
        initKeycloak().catch(() => {
            return;
        });
    }, []);

    return <KeycloakContext.Provider value={keycloak}>{children}</KeycloakContext.Provider>;
};

export default function useKeycloak() {
    return useContext(KeycloakContext);
}
