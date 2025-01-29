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
import { httpGet, httpPatch } from '../api';
import useKeycloak from '../contexts/KeycloakContext';

import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';

import { DATASETS_PATH } from '../endpoints';

export default function EDCDebug() {
    const keycloak = useKeycloak();

    const [negotiationId, setNegotiationId] = useState<string>('');

    useEffect(() => {
        httpGet(keycloak, DATASETS_PATH + '/catalogue').then((result) => {
            console.log(result);
        });
    }, [keycloak]);

    const handleSearchButtonClick = () => {
        httpPatch(keycloak, DATASETS_PATH + `/transfer/${negotiationId}`);
    };

    const setNegotiationIdChecked = (id: string) => {
        setNegotiationId(id);
        console.log(negotiationId);
    };

    return (
        <>
            <TextField
                id="input_negotiation"
                label="Negotiation_ID"
                variant="standard"
                value={negotiationId}
                onChange={(e) => setNegotiationIdChecked(e.target.value)}
            />
            <LoadingButton
                color="primary"
                aria-label="search"
                component="span"
                onClick={handleSearchButtonClick}
                loading={false}
            >
                <SearchIcon />
            </LoadingButton>
        </>
    );
}
