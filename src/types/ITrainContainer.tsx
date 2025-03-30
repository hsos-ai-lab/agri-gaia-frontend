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

import IDataset from './IDataset';

export default interface ITrainContainer {
    container_id?: string;
    last_modified?: string;
    score?: number;
    id: number;
    image_id: string;
    repository: string;
    tag: string;
    owner: string;
    provider: string;
    architecture: string;
    dataset_id: number;
    dataset: IDataset;
    status: string;
    score_name: string;
}
