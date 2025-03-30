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

import ITrainContainer from './ITrainContainer';

export default interface ITrainContainersListProps {
    trainContainers: ITrainContainer[];
    username: string | undefined;
    onDelete: () => void;
    onRun: () => void;
    onStop: () => void;
    onModelTransfer: () => void;
    onEdit: (config: any) => void;
}
