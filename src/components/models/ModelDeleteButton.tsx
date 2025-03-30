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

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../common/ConfirmationDialog';
import AlertSnackbar from '../common/AlertSnackbar';

import { MODELS_PATH } from '../../endpoints';

export default function ({
    modelId,
    modelName,
    onDelete,
}: {
    modelId: number;
    modelName: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [deleteModelErrorOpen, setDeleteModelErrorOpen] = useState<boolean>(false);

    const deleteModel = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${MODELS_PATH}/${modelId}`)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                switch (error.status) {
                    case 409:
                        setDeleteModelErrorOpen(true);
                        break;
                }
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deleteModel();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Model"
                    message={`Do you really want to delete the model ${modelName}?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}

            <Tooltip title="Delete">
                <LoadingButton aria-label="delete" loading={isDeleting} onClick={() => setConfirmDialogOpen(true)}>
                    <DeleteIcon />
                </LoadingButton>
            </Tooltip>
            <AlertSnackbar
                message="Cannot delete a Model that is used by a Container Image."
                severity="error"
                open={deleteModelErrorOpen}
                onClose={() => setDeleteModelErrorOpen(false)}
            />
        </>
    );
}
