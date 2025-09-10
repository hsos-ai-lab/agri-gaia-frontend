// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

export default interface IDeviceHeader {
    ip: string;
    name: string;
    hostname: string;
    heartbeat_interval: number;
    timestamp: string;
    online: boolean;
}
