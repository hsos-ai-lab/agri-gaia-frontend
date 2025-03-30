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

import { useState } from 'react';

import { httpPost, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';

import Tooltip from '@mui/material/Tooltip';
import StopIcon from '@mui/icons-material/Stop';
import LoadingButton from '@mui/lab/LoadingButton';

import { TRAIN_CONTAINERS_PATH } from '../../endpoints';

export default function ({ trainContainerId, onStop }: { trainContainerId: number; onStop: () => void }) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [containerStopping, setContainerStopping] = useState<boolean>(false);

    const stopTrainContainer = async () => {
        setContainerStopping(true);
        httpPost(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/stop`, undefined, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => {
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, () => {
                            setContainerStopping(false);
                            onStop();
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <Tooltip title="Stop Training">
                <span>
                    <LoadingButton onClick={stopTrainContainer} loading={containerStopping}>
                        <StopIcon />
                    </LoadingButton>
                </span>
            </Tooltip>
        </>
    );
}
