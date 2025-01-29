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

export default interface IModel {
    name: string;
    id: number;
    owner: string;
    last_modified: string;
    bucket_name: string;
    file_size: number;
    file_name: string;
    format: string;
    input_name: string | undefined;
    input_datatype: string | undefined;
    input_shape: number[] | undefined;
    input_semantics: string | undefined;
    output_name: string | undefined;
    output_datatype: string | undefined;
    output_shape: number[] | undefined;
    output_labels: string[] | undefined;
    public: boolean;
}

export const TENSOR_DATATYPES = [
    'float16',
    'float32',
    'float64',
    'int8',
    'int16',
    'int32',
    'int64',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'bool',
    'string',
].map((element) => ({ value: element, label: element }));

export const INPUT_TENSOR_SHAPE_SEMANTICS = ['HWC', 'NHWC', 'CHW', 'NCHW'].map((element) => ({
    value: element,
    label: element,
}));

export const MODEL_FORMATS = [
    {
        value: 'onnx',
        label: 'ONNX',
    },
    {
        value: 'pytorch',
        label: 'Pytorch',
    },
    {
        value: 'tensorflow',
        label: 'Tensorflow',
    },
    {
        value: 'tensorrt',
        label: 'TensorRT',
    },
];
