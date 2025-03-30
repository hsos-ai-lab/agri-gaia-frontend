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

import Box from '@mui/material/Box';
import React from 'react';
import hsosLogo from '../../imgs/hsos-logo-compact.png';

export default function HSOSLogo() {
    return (
        <Box sx={{ mr: 2 }}>
            <img src={hsosLogo} height="40px" />
        </Box>
    );
}
