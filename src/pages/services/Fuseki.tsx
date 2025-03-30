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
import Iframe from 'react-iframe';

import { PROJECT_BASE_URL } from '../../api';

export default function Fuseki() {
    return (
        <Iframe
            url={`https://fuseki.${PROJECT_BASE_URL}`}
            width="100%"
            height="90%"
            id="fuski-iframe"
            className=""
            display="block"
            position="absolute"
            frameBorder={0}
        />
    );
}
