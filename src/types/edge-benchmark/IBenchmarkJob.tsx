// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import IDataset from '../IDataset';
import IModel from '../IModel';

export enum InferenceClient {
    TritonDenseNetClient = 'TritonDenseNetClient',
    TritonYoloClient = 'TritonYoloClient',
}

export default interface BenchmarkJob {
    id: number;
    owner: string;
    bucket_name: string;
    minio_location?: string;
    timestamp: string;
    last_modified: string;

    dataset: IDataset;
    model: IModel;
    cpu_only: boolean;
    edge_device: string;
    inference_client: InferenceClient;
}
