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

import { httpDelete } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import LoadingButton from '@mui/lab/LoadingButton';

import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../common/ConfirmationDialog';

import { CONTAINER_IMAGES_PATH } from '../../endpoints';
import IContainerImage from '../../types/IContainerImage';
import AlertSnackbar from '../common/AlertSnackbar';

export default function ({
    containerImage: containerImage,
    onDelete,
}: {
    containerImage: IContainerImage;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [errorSnackBarOpen, setErrorSnackBarOpen] = useState<boolean>(false);

    const deleteContainer = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${CONTAINER_IMAGES_PATH}/${containerImage.repository}:${containerImage.tag}`)
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
                    title="Delete Container"
                    message={`Do you really want to delete the container ${containerImage.repository}:${containerImage.tag}?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <AlertSnackbar
                message="Could not delete Image. Check active Deployments!"
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
