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

import React from 'react';
import Grid from '@mui/material/Grid';

interface INoDataYetProps {
    data: Array<unknown>;
    name: string;
    isLoading?: boolean;
}

export default function ({ data, name, isLoading }: INoDataYetProps) {
    if (data.length !== 0 || isLoading) return null;
    return (
        <Grid container justifyContent="center" marginTop={4}>
            <Grid item xs={2} style={{ textAlign: 'center' }}>
                No {name} yet...
            </Grid>
        </Grid>
    );
}
