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

import { INFERENCE_CONTAINER_TEMPLATES_PATH } from '../../endpoints';
import IInferenceContainerTemplate from '../../types/IInferenceContainerTemplate';
import AlertSnackbar from '../common/AlertSnackbar';

export default function ({
    containerTemplate: containerTemplate,
    onDelete,
}: {
    containerTemplate: IInferenceContainerTemplate;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [errorSnackBarOpen, setErrorSnackBarOpen] = useState<boolean>(false);

    const deleteContainer = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${INFERENCE_CONTAINER_TEMPLATES_PATH}/${containerTemplate.id}`)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                setErrorSnackBarOpen(true);
            })
            .finally(() => setIsDeleting(false));
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deleteContainer();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Container Template"
                    message={`Do you really want to delete the container template "${containerTemplate.name}"?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <AlertSnackbar
                message="Could not delete Template"
                severity="error"
                open={errorSnackBarOpen}
                onClose={() => setErrorSnackBarOpen(false)}
            />
            <Tooltip title="Delete">
                <LoadingButton aria-label="delete" loading={isDeleting} onClick={() => setConfirmDialogOpen(true)}>
                    <DeleteIcon />
                </LoadingButton>
            </Tooltip>
        </>
    );
}
