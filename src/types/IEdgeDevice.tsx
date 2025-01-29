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

import IContainerDeployment from './IContainerDeployment';

export default interface IEdgeDevice {
    id: number;
    name: string;
    hardware_id?: string;
    os?: string;
    cpu_count?: string;
    arch?: string;
    memory?: string;
    tags?: Array<string>;
    last_heartbeat?: string;
    registered: string;
    edge_key: string;
    container_deployments: Array<IContainerDeployment>;
}
