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

import { TritonDenseNetClient, TritonYoloClient } from './IInferenceClients';
import EdgeDevice from './IEdgeDevice';

export default interface BenchmarkConfig {
    edge_device: EdgeDevice;
    inference_client: TritonDenseNetClient | TritonYoloClient;
    cpu_only?: boolean;
}
