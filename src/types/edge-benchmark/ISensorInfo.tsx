// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import ISensorStatus from './ISensorStatus';

export enum SensorType {
    CAMERA = 'camera',
}

export default interface ISensorInfo {
    type: SensorType;
    name: string;
    manufacturer: string;
    model: string;
    serial: string;
    hostname: string;
    ip: string;
    status?: ISensorStatus;
}
