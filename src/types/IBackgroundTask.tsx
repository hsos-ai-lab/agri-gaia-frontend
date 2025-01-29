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

import { TaskStatusType } from './TaskStatus';

export interface IBackgroundTask {
    id: number;
    initiator: string;
    title?: string;
    creation_date: string;
    status: TaskStatusType;
    completion_percentage: number;
    message?: string;
    taskCompleteCallback?: (task: IBackgroundTask) => void;
}
