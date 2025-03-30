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

import IEdgeDevice from '../../types/IEdgeDevice';
import { DateTime } from 'luxon';
import { getLocalDateTime } from '../../util';

export const getStatus = (device: IEdgeDevice) => {
    if (device.last_heartbeat) {
        // the Device is Online, if there was a Hearbeat in the last five minutes

        const beat = DateTime.fromISO(device.last_heartbeat, { zone: 'utc' });
        const diffNow = beat.diffNow('minutes');

        return diffNow.minutes > -5 ? 'Online' : 'Offline';
    }
    return 'waiting for registration';
};

export const getHeartbeatTime = (heartbeat?: string) => {
    if (!heartbeat) {
        return 'Never';
    }
    return getLocalDateTime(heartbeat);
};
