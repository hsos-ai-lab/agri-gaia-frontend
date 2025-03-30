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

export enum DatasetType {
    IMAGE = 'AgriImageDataResource',
    CSV = 'AgriCsvDataResource',
    JSON = 'AgriJsonDataResource',
}

export default interface IDataset {
    id: number;
    name: string;

    /*bucketName: string;
    downloadURL: string;
    creator?: string;
    creationDate?: string;
    annotation_date: null*/
    annotator: string;
    bucket_name: string;
    filecount: number;
    last_modified: string;
    metadata_uri: string;
    owner: string;
    total_filesize: number;
    public: boolean;
    dataset_type: DatasetType;
}
