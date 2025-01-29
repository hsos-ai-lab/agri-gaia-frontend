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

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';

import { httpGet } from '../api';
import { USERS_ME } from '../endpoints';
import useKeycloak from '../contexts/KeycloakContext';

interface IUserInfo {
    name?: string;
    email?: string;
    id?: string;
}

interface IBackendData {
    hello: string;
    token: string;
}

export default function () {
    const [userInfo, setUserInfo] = useState<IUserInfo | undefined>(undefined);
    const [backendData, setBackendData] = useState<IBackendData | undefined>(undefined);

    const keycloak = useKeycloak();

    const fetchUserInfo = async () => {
        if (keycloak?.authenticated && userInfo === undefined) {
            keycloak.loadUserProfile().then((profile) => {
                setUserInfo({
                    name: profile.firstName,
                    email: profile.email,
                    id: profile.id,
                });
            });
        }
    };

    const fetchBackendData = async () => {
        httpGet(keycloak, USERS_ME)
            .then((data) => {
                setBackendData(data);
            })
            .catch((error) => {
                console.error(error);
                setBackendData({ hello: ':(', token: '' });
            });
    };

    useEffect(() => {
        fetchUserInfo();
        fetchBackendData();
    }, [keycloak]);

    const getValidUntil = () => {
        if (keycloak?.tokenParsed?.exp) {
            const until = new Date(keycloak.tokenParsed.exp * 1000);
            return until.toLocaleString();
        }
        return '?';
    };

    const copyAuthTokenToClipboard = () => {
        window.prompt('Copy to clipboard: Ctrl+C, Enter', backendData?.token);
    };

    if (keycloak?.authenticated) {
        return (
            <>
                <div className="UserInfoKeycloak">
                    <h2>Infos from Keycloak:</h2>
                    <p>
                        Name:
                        {userInfo?.name}
                    </p>
                    <p>
                        Email:
                        {userInfo?.email}
                    </p>
                    <p>
                        ID:
                        {userInfo?.id}
                    </p>
                    <p>Token Valid until: {getValidUntil()}</p>
                </div>
                <div className="DataBackend">
                    <h2>Data from FastAPI:</h2>
                    <p>
                        Hello:
                        {backendData?.hello}
                    </p>
                    <Button type="button" color="secondary" onClick={copyAuthTokenToClipboard}>
                        Copy Auth Token
                    </Button>

                    <Button type="button" onClick={fetchBackendData}>
                        Fetch User Info again!
                    </Button>
                </div>
                <p>
                    Reloaded at:
                    {new Date().toLocaleTimeString()}
                </p>
            </>
        );
    }
    return null;
}
