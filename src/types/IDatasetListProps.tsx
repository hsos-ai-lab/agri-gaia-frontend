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

import { Dispatch, SetStateAction } from 'react';
import IDataset from './IDataset';

export default interface IDatasetListProps {
    datasets: IDataset[];
    username: string | undefined;
    connectorAvailable: boolean;
    onDelete: () => void;
    onTogglePublic: (dataset_id: number) => void;
    selected: readonly number[];
    setSelected: Dispatch<SetStateAction<readonly number[]>>;
}
