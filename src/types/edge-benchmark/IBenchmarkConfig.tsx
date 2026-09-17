// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { ITritonDenseNetClient, ITritonYoloClient } from './IInferenceClients';
import IEdgeDevice from './IEdgeDevice';

export default interface IBenchmarkConfig {
    edge_device: IEdgeDevice;
    inference_client: ITritonDenseNetClient | ITritonYoloClient;
    cpu_only?: boolean;
    // Where the benchmark loop runs. Omitted means 'manager', the historical
    // behaviour: the Edge-Farm API runs the loop, so preprocessing and
    // postprocessing are measured on its x86 CPU and every inference crosses
    // the LAN. 'device' runs the whole pipeline on the edge device itself.
    execution_mode?: 'manager' | 'device';
}
