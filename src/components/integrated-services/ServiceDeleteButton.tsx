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
import useCvat from '../../contexts/CvatContext';

import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import ConfirmationDialog from '../common/ConfirmationDialog';
import AlertSnackbar from '../common/AlertSnackbar';

import { INTEGRATED_SERVICES_PATH } from '../../endpoints';

export default function ({
    serviceId: serviceId,
    serviceName: serviceName,
    onDelete,
}: {
    serviceId: number;
    serviceName: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const [deleteServiceError, setDeleteServiceError] = useState<string>('');

    const deleteDataset = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${INTEGRATED_SERVICES_PATH}/${serviceId}`)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                setDeleteServiceError(error);
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
                    title="Delete Service"
                    message={`Do you really want to delete the service ${serviceName}`}
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
        </>
    );
}
