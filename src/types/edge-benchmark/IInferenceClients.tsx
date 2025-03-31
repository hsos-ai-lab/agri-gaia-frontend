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

export default interface InferenceClient {
    protocol?: string;
    host: string;
    num_workers?: number;
    samples_per_second?: number | null;
}

export interface TritonInferenceClient extends InferenceClient {
    model_name?: string | null;
    model_version?: string;
    batch_size?: number;
    warm_up?: boolean;
}

export interface TritonDenseNetClient extends TritonInferenceClient {
    num_classes?: number;
    scaling?: string | null;
}

export interface TritonYoloClient extends TritonInferenceClient {
    num_classes?: number;
    scaling?: string | null;
    confidence_thres?: number;
    iou_thres?: number;
    input_width: number;
    input_height: number;
}
