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

import { httpGet, httpPut } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import UploadIcon from '@mui/icons-material/Upload';
import ConfirmationDialog from '../common/ConfirmationDialog';

import { CONTAINER_DEPLOYMENTS_PATH } from '../../endpoints';
import { IBackgroundTask } from '../../types/IBackgroundTask';

export default function ({
    containerDeploymentId,
    containerDeploymentName,
    onDeploy: onDeploy,
}: {
    containerDeploymentId: number;
    containerDeploymentName: string;
    onDeploy: () => void;
}) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [isDeploying, setIsDeploying] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const deployContainerDeployment = async () => {
        setIsDeploying(true);
        httpPut(keycloak, `${CONTAINER_DEPLOYMENTS_PATH}/${containerDeploymentId}/deploy`, undefined, {}, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task: IBackgroundTask) => {
                        if (task.status == 'completed' || task.status == 'failed') {
                            setIsDeploying(false);
                            onDeploy();
                        }
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, (task) => {
                            setIsDeploying(false);
                            onDeploy();
                        });
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deployContainerDeployment();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Deploy Container Deployment"
                    message={`Do you really want to deploy the container Deployment ${containerDeploymentName}?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <Tooltip title="Deploy">
                <LoadingButton loading={isDeploying} onClick={() => setConfirmDialogOpen(true)}>
                    <UploadIcon />
                </LoadingButton>
            </Tooltip>
        </>
    );
}
