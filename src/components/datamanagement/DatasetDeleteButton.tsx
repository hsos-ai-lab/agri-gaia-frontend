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

import { httpDelete } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useCvat from '../../contexts/CvatContext';

import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import ConfirmationDialog from '../common/ConfirmationDialog';
import AlertSnackbar from '../common/AlertSnackbar';

import { DATASETS_PATH } from '../../endpoints';

export default function ({
    datasetId,
    datasetName,
    referencingModelNames,
    onDelete,
}: {
    datasetId: number;
    datasetName: string;
    referencingModelNames: string[];
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | undefined>(undefined);

    const isReferenced = referencingModelNames.length > 0;
    const tooltip = isReferenced
        ? `Cannot delete: this dataset is used by model${referencingModelNames.length > 1 ? 's' : ''} ` +
          `${referencingModelNames.join(', ')}. Delete ${referencingModelNames.length > 1 ? 'those models' : 'that model'} first.`
        : 'Delete';

    const deleteDataset = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${DATASETS_PATH}/${datasetId}`, cvat?.auth)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                const errorDetail = error?.body?.detail;
                switch (error.status) {
                    case 409:
                        setDeleteErrorMsg(errorDetail);
                        break;
                    case 422:
                        if (errorDetail?.includes('train_containers_dataset_id_fkey'))
                            setDeleteErrorMsg('Cannot delete a Dataset that is used by a Train Container.');
                        break;
                }
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deleteDataset();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Dataset"
                    message={`Do you really want to delete the dataset ${datasetName}`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <Tooltip title={tooltip}>
                <span>
                    <LoadingButton
                        aria-label="delete"
                        loading={isDeleting}
                        disabled={isReferenced}
                        onClick={() => setConfirmDialogOpen(true)}
                    >
                        <DeleteIcon />
                    </LoadingButton>
                </span>
            </Tooltip>
            <AlertSnackbar
                message={deleteErrorMsg}
                severity="error"
                open={!!deleteErrorMsg}
                onClose={() => setDeleteErrorMsg(undefined)}
            />
        </>
    );
}
