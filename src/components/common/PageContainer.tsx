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
import AppBar from '../nav/AppBar';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';

import Footer from '../Footer';
import SideNav from '../nav/SideNav';

import useKeycloak from '../../contexts/KeycloakContext';
import { httpGet } from '../../api';
import { USERS_PING } from '../../endpoints';
import { SideNavWidthContext, SideNavClosedWidth, SideNavOpenWidth } from '../../contexts/SideNavWidthContext';
interface IPageContainerProps {
    children?: React.ReactNode;
    maxWidth?: string;
}

export default function PageContainer(props: IPageContainerProps) {
    const keycloak = useKeycloak();

    const [sideNavOpen, setSideNavOpen] = useState(true);
    const [sideNavWidth, setSideNavWidth] = useState(SideNavOpenWidth);

    const toggleSideNavState = () => {
        if (sideNavOpen) {
            setSideNavOpen(false);
            setSideNavWidth(SideNavClosedWidth);
        } else {
            setSideNavOpen(true);
            setSideNavWidth(SideNavOpenWidth);
        }
    };

    const fetchUser = async () => {
        httpGet(keycloak, USERS_PING);
    };

    useEffect(() => {
        // create an interval to fetch the user every minute
        // so the page gets redirected to login, once the token expired
        const userFetchInterval = setInterval(fetchUser, 60000);
        console.log('Starting User Fetch Interval');

        return () => {
            clearInterval(userFetchInterval);
            console.log('Stopping User Fetch Interval');
        };
    }, [keycloak]);

    return (
        <>
            {keycloak?.authenticated ? (
                <>
                    <SideNavWidthContext.Provider value={{ isOpen: sideNavOpen, width: sideNavWidth }}>
                        <AppBar toggleSideNav={toggleSideNavState} />
                        <SideNav />
                        <Box component="main" sx={{ height: '100%', flexGrow: 1, p: 3, ml: `${sideNavWidth}px` }}>
                            <Toolbar />
                            {props.children}
                        </Box>
                        <Footer />
                    </SideNavWidthContext.Provider>
                </>
            ) : null}
        </>
    );
}
