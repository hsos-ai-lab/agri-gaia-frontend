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
import agriGaiaLogo from '../../imgs/agri-gaia-logo.png';

function AgriGaiaLogo({ onClick }: { onClick: () => void }) {
    return <img src={agriGaiaLogo} height="40px" onClick={onClick} style={{ cursor: 'pointer' }} />;
}

export default AgriGaiaLogo;
