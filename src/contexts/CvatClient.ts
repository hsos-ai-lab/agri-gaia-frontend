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

import ICvatAuth from '../types/ICvatAuth';

import { PROJECT_BASE_URL, httpGet, httpPost } from '../api';
import { CVAT_USER_CREATE_PATH, CVAT_USER_EXISTS_PATH, CVAT_LOGIN_PATH, CVAT_LOGOUT_PATH } from '../endpoints';
import Keycloak from 'keycloak-js';
import ICvatUser from '../types/ICvatUser';

class CvatClient {
    private keycloak: Keycloak.KeycloakInstance;

    constructor(keycloak: Keycloak.KeycloakInstance) {
        this.keycloak = keycloak;
    }

    setAuthCookie(name: string, value: string): void {
        console.log(`Writing CVAT Auth Cookie ${name}=${value}`);
        document.cookie = `${name}=${value}; domain=.${PROJECT_BASE_URL}; path=/; secure; samesite=lax;`;
    }

    deleteAuthCookie(name: string): void {
        console.log(`Deleting CVAT Auth Cookie '${name}'.`);
        document.cookie = `${name}=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }

    setLocalStorageItem(key: string, value: string): void {
        console.log(`Setting CVAT Local Storage '${key}': ${value}`);
        localStorage.setItem(key, value);
    }

    deleteLocalStorageItem(key: string): void {
        console.log(`Deleting CVAT Local Storage '${key}'.`);
        localStorage.removeItem(key);
    }

    userExists(): Promise<boolean> {
        return new Promise((resolve) => {
            httpGet(this.keycloak, CVAT_USER_EXISTS_PATH)
                .then((user) => {
                    console.log(`Existence of CVAT REST user "${user.username}":`, user.exists);
                    resolve(user.exists);
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    userCreate(): Promise<ICvatUser> {
        return new Promise((resolve) => {
            httpPost(this.keycloak, CVAT_USER_CREATE_PATH)
                .then((user) => {
                    console.log(`Created CVAT REST User "${user.username}" from JWT.`);
                    resolve(user);
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }

    login(): Promise<ICvatAuth> {
        return new Promise((resolve, reject) => {
            httpPost(this.keycloak, CVAT_LOGIN_PATH)
                .then((auth: ICvatAuth) => {
                    console.log(`Obtained CVAT REST token for current user:`, auth.key);
                    resolve(auth);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }

    logout(auth: ICvatAuth): Promise<ICvatAuth> {
        return new Promise((resolve) => {
            httpPost(this.keycloak, CVAT_LOGOUT_PATH, auth)
                .then((auth) => {
                    console.log('CVAT logout successful.');
                    resolve(auth);
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    }
}

export default CvatClient;
