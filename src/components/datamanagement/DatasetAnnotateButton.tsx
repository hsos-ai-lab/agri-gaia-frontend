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
import { httpPost, httpPatch } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useCvat from '../../contexts/CvatContext';

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';

import { DATASETS_PATH, CVAT_PATH } from '../../endpoints';

import { openInNewTab, createSubdomainUrl } from '../../util';
import AnnotateDatasetDialog from './AnnotateDatasetDialog';
import IAlertMessage from '../../types/IAlertMessage';
import AlertSnackbar from '../../components/common/AlertSnackbar';

export default function ({
    datasetName,
    datasetId,
    disabled,
}: {
    datasetName: string;
    datasetId: number;
    disabled: boolean;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [annotateDatasetDialogOpen, setAnnotateDatasetDialogOpen] = useState<boolean>(false);
    const [taskCreating, setTaskCreating] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    const onError = (error: Error) => {
        console.error(error);
        setTaskCreating(false);
    };

    const annotateDataset = async (datasetId: number) => {
        setTaskCreating(true);
        httpPost(keycloak, `${DATASETS_PATH}/${datasetId}/annotate`)
            .then(() => {
                httpPost(keycloak, `${CVAT_PATH}/tasks/${datasetId}`, cvat?.auth)
                    .then((task) => {
                        httpPatch(keycloak, `${DATASETS_PATH}/${datasetId}`, { annotation_task_id: task.id })
                            .then(() => {
                                openInNewTab(createSubdomainUrl('cvat', `/?next=${task.next}`));
                                setTaskCreating(false);
                            })
                            .catch((error) => onError(error));
                    })
                    .catch((error) => onError(error));
            })
            .catch((error) => onError(error));
    };

    return (
        <>
            <Tooltip title="Annotate">
                <span>
                    <LoadingButton
                        aria-label="edit"
                        disabled={disabled}
                        loading={taskCreating}
                        onClick={() => setAnnotateDatasetDialogOpen(true)}
                    >
                        <EditIcon />
                    </LoadingButton>
                </span>
            </Tooltip>

            {annotateDatasetDialogOpen ? (
                <AnnotateDatasetDialog
                    datasetName={datasetName}
                    annotateDataset={() => annotateDataset(datasetId)}
                    onUpload={(uploadMessage: IAlertMessage) => {
                        setSnackbarMessage(uploadMessage);
                    }}
                    handleClose={() => setAnnotateDatasetDialogOpen(false)}
                />
            ) : null}
            <AlertSnackbar
                message={snackbarMessage.message}
                severity={snackbarMessage.severity}
                open={snackbarMessage.open}
                onClose={() => setSnackbarMessage({ ...snackbarMessage, open: false })}
            />
        </>
    );
}
