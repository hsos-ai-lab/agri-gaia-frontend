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

import React, { useState } from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import GeographicDataComponent from '../components/open-data/geographic/GeographicDataComponent';
import { Card, CardContent } from '@mui/material';

const dataTypes = ['Geographic', 'Audio'];

const renderSelectedDataTypeView = (dataType: string) => {
    switch (dataType) {
        case 'Geographic':
            return <GeographicDataComponent />;

        default:
            return 'The selected Data Type is not supported, yet!';
    }
};

export default function OpenData() {
    const [dataType, setDataType] = useState(dataTypes[0]);

    return (
        <>
            <Card id="open-data-type-select-card" className="map-overlay-card">
                <CardContent id="open-data-type-select-card-content">
                    <FormControl fullWidth variant="standard">
                        <InputLabel id="data-type-input-label">Data Type</InputLabel>
                        <Select
                            labelId="data-type-input-label"
                            id="data-type-select"
                            value={dataType}
                            label="Data Type"
                            onChange={(event: SelectChangeEvent) => {
                                setDataType(event.target.value);
                            }}
                        >
                            {dataTypes.map((dataType) => (
                                <MenuItem key={dataType} value={dataType}>
                                    {dataType}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>
            {renderSelectedDataTypeView(dataType)}
        </>
    );
}
