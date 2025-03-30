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
    onDelete,
}: {
    datasetId: number;
    datasetName: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [deleteDatasetErrorOpen, setDeleteDatasetErrorOpen] = useState<boolean>(false);

    const deleteDataset = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${DATASETS_PATH}/${datasetId}`, cvat?.auth)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                const errorDetail = error?.body?.detail;
                switch (error.status) {
                    case 422:
                        if (errorDetail?.includes('train_containers_dataset_id_fkey')) setDeleteDatasetErrorOpen(true);
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
            <Tooltip title="Delete">
                <span>
                    <LoadingButton aria-label="delete" loading={isDeleting} onClick={() => setConfirmDialogOpen(true)}>
                        <DeleteIcon />
                    </LoadingButton>
                </span>
            </Tooltip>
            <AlertSnackbar
                message="Cannot delete a Dataset that is used by a Train Container."
                severity="error"
                open={deleteDatasetErrorOpen}
                onClose={() => setDeleteDatasetErrorOpen(false)}
            />
        </>
    );
}
