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

import React from 'react';

import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';

import useKeycloak from '../../contexts/KeycloakContext';
import useCvat from '../../contexts/CvatContext';

const Logout = function () {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    async function handleLogout(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        await cvat?.logout(cvat);
        await keycloak?.logout();
    }

    if (!keycloak?.authenticated) {
        return null;
    }
    return (
        <IconButton aria-label="logout" onClick={handleLogout} color="inherit">
            <LogoutIcon />
        </IconButton>
    );
};

export default Logout;
