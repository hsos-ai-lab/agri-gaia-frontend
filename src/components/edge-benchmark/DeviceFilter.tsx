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

import { TextField } from '@mui/material';
import React, { ChangeEvent } from 'react';

const DeviceFilter = ({ onFilterChange }: { onFilterChange: (filter: string) => void }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onFilterChange(e.target.value);
    };

    return (
        <div className="device-filter">
            <TextField
                id="outlined-basic"
                label="Filter devices..."
                variant="outlined"
                onChange={handleChange}
                size="small"
            />
        </div>
    );
};

export default DeviceFilter;
