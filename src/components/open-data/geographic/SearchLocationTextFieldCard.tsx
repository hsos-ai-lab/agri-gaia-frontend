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

import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { SideNavWidthContext } from '../../../contexts/SideNavWidthContext';
import classNames from 'classnames';
export default ({
    onChange,
    onKeyDown,
    value,
}: {
    onChange: (value: string) => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    value: string;
}) => {
    return (
        <SideNavWidthContext.Consumer>
            {({ isOpen }) => (
                <Paper
                    id="search-location-card"
                    className={classNames({
                        'map-overlay-card': true,
                        'map-overlay-left-sidenav-open': isOpen,
                        'map-overlay-left-sidenav-closed': !isOpen,
                    })}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search for Locations"
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        value={value}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>
            )}
        </SideNavWidthContext.Consumer>
    );
};
