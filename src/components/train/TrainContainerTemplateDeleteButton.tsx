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

import Fab from '@mui/material/Fab';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import ConfirmationDialog from '../common/ConfirmationDialog';
import IAlertMessage from '../../types/IAlertMessage';
import { AlertColor } from '@mui/material/Alert';

import { TRAIN_TEMPLATE_PATH } from '../../endpoints';

interface ITrainContainerTemplateDeleteButtonProps {
    provider: string;
    architecture: string;
    onDelete: (deleteMessage: IAlertMessage) => void;
}

export default function ({ provider, architecture, onDelete }: ITrainContainerTemplateDeleteButtonProps) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const deleteTrainContainerTemplate = async () => {
        setIsDeleting(true);
        await httpDelete(keycloak, `${TRAIN_TEMPLATE_PATH}`, { provider: provider, architecture: architecture })
            .then(() => {
                const deleteMessage = {
                    message: `Successfully deleted ${architecture} (${provider}).`,
                    severity: 'success' as AlertColor,
                    open: true,
                };
                onDelete(deleteMessage);
            })
            .catch((error) => {
                onDelete({ message: error.body.detail, severity: 'error', open: true });
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleConfirmationResult = async (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) await deleteTrainContainerTemplate();
    };

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Train Container Template"
                    message={`Do you really want to delete ${architecture} (${provider})?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <Fab aria-label="delete" size="small" color="secondary" onClick={() => setConfirmDialogOpen(true)}>
                {isDeleting ? <CircularProgress color="primary" /> : <DeleteIcon />}
            </Fab>
        </>
    );
}
