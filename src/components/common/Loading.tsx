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
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

interface ILoadingProps {
    isLoading: boolean;
}

export default function ({ isLoading }: ILoadingProps) {
    if (!isLoading) return null;
    return (
        <Grid container justifyContent="center" marginTop={4}>
            <Grid item xs={2} style={{ textAlign: 'center' }}>
                <CircularProgress color="primary" />
            </Grid>
        </Grid>
    );
}
