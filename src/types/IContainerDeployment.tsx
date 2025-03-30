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

import IPortBinding from './IPortBinding';
import IContainerImage from './IContainerImage';
export default interface IContainerDeployment {
    id: number;
    container_image: IContainerImage;
    edge_device_id: number | '';
    creation_date: string;
    status: string;
    name: string;
    version: string;
    image: string;
    port_bindings: Array<IPortBinding>;
    public: boolean;
}
