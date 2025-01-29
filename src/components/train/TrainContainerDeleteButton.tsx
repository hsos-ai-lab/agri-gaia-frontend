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

import { TRAIN_CONTAINERS_PATH } from '../../endpoints';

export default function ({
    trainContainerId,
    repository,
    tag,
    onDelete,
}: {
    trainContainerId: number;
    repository: string;
    tag: string;
    onDelete: () => void;
}) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const deleteTrainContainer = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}`)
            .then(() => {
                console.log(`Deleted train container '${repository}:${tag}'.`);
                onDelete();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) {
            deleteTrainContainer();
        }
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Train Container"
                    message={`Do you really want to delete the train container ${repository}:${tag}?`}
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
