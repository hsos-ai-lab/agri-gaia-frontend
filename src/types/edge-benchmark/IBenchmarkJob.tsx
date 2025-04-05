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

    dataset_id: number;
    model_id: number;
    cpu_only: boolean;
    edge_device: string;
    inference_client: InferenceClient;
}
