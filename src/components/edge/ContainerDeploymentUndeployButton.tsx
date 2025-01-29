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

import { httpGet, httpPut } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import RemoveIcon from '@mui/icons-material/PlaylistRemove';
import ConfirmationDialog from '../common/ConfirmationDialog';

import { CONTAINER_DEPLOYMENTS_PATH } from '../../endpoints';
import { IBackgroundTask } from '../../types/IBackgroundTask';

export default function ({
    containerDeploymentId,
    containerDeploymentName,
    onUndeploy,
}: {
    containerDeploymentId: number;
    containerDeploymentName: string;
    onUndeploy: () => void;
}) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [isUndeploying, setIsUndeploying] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const undeployContainerDeployment = async () => {
        setIsUndeploying(true);
        httpPut(keycloak, `${CONTAINER_DEPLOYMENTS_PATH}/${containerDeploymentId}/undeploy`, {}, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task: IBackgroundTask) => {
                        if (task.status == 'completed' || task.status == 'failed') {
                            setIsUndeploying(false);
                            onUndeploy();
                        }
                        tasks?.addServerBackgroundTask(keycloak, tasks, task, (task) => {
                            setIsUndeploying(false);
                            onUndeploy();
                        });
                    })
                    .catch(console.error);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) undeployContainerDeployment();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Undeploy Container Deployment"
                    message={`Do you really want to undeploy the container Deployment ${containerDeploymentName}?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <Tooltip title="Undeploy">
                <LoadingButton loading={isUndeploying} onClick={() => setConfirmDialogOpen(true)}>
                    <RemoveIcon />
                </LoadingButton>
            </Tooltip>
        </>
    );
}
