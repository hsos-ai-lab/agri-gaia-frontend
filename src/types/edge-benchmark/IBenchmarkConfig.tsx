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

import { ITritonDenseNetClient, ITritonYoloClient } from './IInferenceClients';
import IEdgeDevice from './IEdgeDevice';

export default interface IBenchmarkConfig {
    edge_device: IEdgeDevice;
    inference_client: ITritonDenseNetClient | ITritonYoloClient;
    cpu_only?: boolean;
}
