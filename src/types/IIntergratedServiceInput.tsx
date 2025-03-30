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
