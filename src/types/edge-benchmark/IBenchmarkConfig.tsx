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
}
