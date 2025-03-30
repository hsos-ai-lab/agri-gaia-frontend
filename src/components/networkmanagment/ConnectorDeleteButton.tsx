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

import { NETWORK_PATH } from '../../endpoints';

export default function ({
    connectorId,
    connectorName,
    onDelete,
}: {
    connectorId: number;
    connectorName: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();
    const cvat = useCvat();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const deleteConnector = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${NETWORK_PATH}/${connectorId}`, cvat?.auth)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deleteConnector();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Connector"
                    message={`Do you really want to delete the connector ${connectorName}`}
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
