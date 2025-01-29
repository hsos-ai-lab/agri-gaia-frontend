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

import IIntergratedServiceInputEnum from './IIntegratedServiceInputEnum';

export default interface IIntergratedServiceInput {
    type: string;
    pattern: string;
    selectProps: Array<IIntergratedServiceInputEnum>;
    id: string;
    label: string;
    name: string;
    required: boolean;
    select: any;
    value: any;
    description: string;
}
