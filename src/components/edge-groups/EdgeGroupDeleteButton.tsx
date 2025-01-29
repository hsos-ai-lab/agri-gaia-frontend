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

import { EDGE_GROUPS_PATH } from '../../endpoints';

export default function ({
    edgeGroupId,
    edgeGroupName,
    onDelete,
}: {
    edgeGroupId: number;
    edgeGroupName: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const deleteEdgeGroup = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${EDGE_GROUPS_PATH}/${edgeGroupId}`)
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
        if (result) deleteEdgeGroup();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Edge Device"
                    message={`Do you really want to delete the edge device ${edgeGroupName}?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <Tooltip title="Delete">
                <LoadingButton loading={isDeleting} onClick={() => setConfirmDialogOpen(true)}>
                    <DeleteIcon />
                </LoadingButton>
            </Tooltip>
        </>
    );
}
