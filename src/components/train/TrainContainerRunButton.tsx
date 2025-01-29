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

import { useState } from 'react';

import { httpPost, httpPatch, httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useCvat from '../../contexts/CvatContext';
import useApplicationTasks from '../../contexts/TasksContext';
import { useInterval } from '../../util';

import Tooltip from '@mui/material/Tooltip';
import StartIcon from '@mui/icons-material/Start';
import LoadingButton from '@mui/lab/LoadingButton';
import TrainContainerStopButton from './TrainContainerStopButton';
import ITrainContainer from '../../types/ITrainContainer';

import { TRAIN_CONTAINERS_PATH } from '../../endpoints';

export default function ({
    trainContainerId,
    onRun,
    onStop,
}: {
    trainContainerId: number;
    onRun: () => void;
    onStop: () => void;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();
    const tasks = useApplicationTasks();

    const [containerStarting, setContainerStarting] = useState<boolean>(false);
    const [containerRunning, setContainerRunning] = useState<boolean>(false);

    const onTrainContainerStop = () => {
        setContainerStarting(false);
        setContainerRunning(false);
        onStop();
    };

    useInterval(() => {
        fetchTrainContainerStatus();
    }, 3);

    const fetchTrainContainerStatus = async () => {
        httpGet(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/status`)
            .then(({ status, score }) => {
                switch (status) {
                    case 'exited':
                        if (containerRunning) setContainerRunning(false);
                        if (score == null) updateTrainContainerScore();
                        break;
                    case 'running':
                        setContainerRunning(true);
                        break;
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const updateTrainContainerScore = async () => {
        httpPatch(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/score`)
            .then((trainContainer: ITrainContainer) => {
                console.log(`Updated score of Train Container #${trainContainerId}:`, trainContainer.score);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const runTrainContainer = async () => {
        setContainerStarting(true);
        setContainerRunning(false);
        httpPost(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/run`, undefined, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => {
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, () => {
                            setContainerStarting(false);
                            setContainerRunning(true);
                            onRun();
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
            {!containerRunning ? (
                <Tooltip title="Start Training">
                    <span>
                        <LoadingButton onClick={runTrainContainer} loading={containerStarting}>
                            <StartIcon />
                        </LoadingButton>
                    </span>
                </Tooltip>
            ) : (
                <TrainContainerStopButton trainContainerId={trainContainerId} onStop={onTrainContainerStop} />
            )}
        </>
    );
}
