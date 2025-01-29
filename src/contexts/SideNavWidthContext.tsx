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

import { createContext } from 'react';

interface ISideNavWidthContextProps {
    isOpen: boolean;
    width: number;
}

const SideNavOpenWidth = 280;
const SideNavClosedWidth = 70;

const SideNavWidthContext = createContext<ISideNavWidthContextProps>({
    isOpen: true,
    width: SideNavOpenWidth,
});

export { SideNavWidthContext, SideNavOpenWidth, SideNavClosedWidth };
