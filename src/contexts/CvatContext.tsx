// SPDX-FileCopyrightText: 2024 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: MIT

import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import CvatClient from './CvatClient';
import useKeycloak from './KeycloakContext';
import ICvatAuth from '../types/ICvatAuth';
import { CVAT_SESSION_ID_COOKIE_NAME, CVAT_CSRF_TOKEN_COOKIE_NAME, CVAT_KEY_LOCAL_STORAGE_NAME } from '../constants';

const CvatContext = createContext<CvatInstance | undefined>(undefined);

interface CvatInstance {
    client: CvatClient | undefined;
    authed: boolean;
    auth: ICvatAuth | undefined;
    logout: (cvat?: CvatInstance) => Promise<void>;
}

export const CvatProvider = function ({ children }: { children: ReactNode }) {
    const keycloak = useKeycloak();

    const onLogout = async (cvat?: CvatInstance) => {
        if (!cvat) {
            return;
        }

        if (cvat?.client) {
            if (cvat?.auth) {
                await cvat.client.logout(cvat.auth);
            }
            cvat.client.deleteAuthCookie(CVAT_SESSION_ID_COOKIE_NAME);
            cvat.client.deleteAuthCookie(CVAT_CSRF_TOKEN_COOKIE_NAME);
            cvat.client.deleteLocalStorageItem(CVAT_KEY_LOCAL_STORAGE_NAME);
        }
        setCvat({ ...cvat, authed: false, auth: undefined });
    };

    const [cvat, setCvat] = useState<CvatInstance>({
        client: undefined,
        authed: false,
        auth: undefined,
        logout: onLogout,
    });

    useEffect(() => {
        if (!cvat.authed && cvat.client)
            cvat.client
                .userExists()
                .then((exists) => {
                    if (!exists) return cvat.client?.userCreate();
                })
                .then(() => {
                    return cvat.client?.login();
                })
                .then((auth) => {
                    if (auth) {
                        cvat.client?.setAuthCookie(CVAT_CSRF_TOKEN_COOKIE_NAME, auth.csrftoken);
                        cvat.client?.setAuthCookie(CVAT_SESSION_ID_COOKIE_NAME, auth.sessionid);
                        cvat.client?.setLocalStorageItem(CVAT_KEY_LOCAL_STORAGE_NAME, auth.key);
                        setCvat({ ...cvat, authed: true, auth });
                    }
                });
    }, [cvat]);

    useEffect(() => {
        if (keycloak?.authenticated)
            setCvat({ ...cvat, client: new CvatClient(keycloak), authed: false, auth: undefined });
    }, [keycloak]);

    return <CvatContext.Provider value={cvat}>{children}</CvatContext.Provider>;
};

export default function useCvat() {
    return useContext(CvatContext);
}
