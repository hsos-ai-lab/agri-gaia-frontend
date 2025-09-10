// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

export interface IInferenceClient {
    protocol?: string;
    host: string;
    port?: number;
    num_workers?: number;
    samples_per_second?: number | null;
}

export interface ITritonInferenceClient extends IInferenceClient {
    model_name?: string | null;
    model_version?: string;
    batch_size?: number;
    warm_up?: boolean;
}

export interface ITritonDenseNetClient extends ITritonInferenceClient {
    num_classes?: number;
    scaling?: string | null;
}

export interface ITritonYoloClient extends ITritonInferenceClient {
    num_classes?: number;
    scaling?: string | null;
    confidence_thres?: number;
    iou_thres?: number;
    input_width: number;
    input_height: number;
}
