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

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import ConfirmationDialog from '../common/ConfirmationDialog';

import { APPLICATIONS_PATH } from '../../endpoints';
import IApplication from '../../types/IApplication';
import AlertSnackbar from '../common/AlertSnackbar';

export default function ({ application, onDelete }: { application: IApplication; onDelete: () => void }) {
    const keycloak = useKeycloak();

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [errorSnackBarOpen, setErrorSnackBarOpen] = useState(false);

    const deleteApplication = async () => {
        setIsDeleting(true);
        httpDelete(keycloak, `${APPLICATIONS_PATH}/${application.id}`)
            .then(onDelete)
            .catch((error) => {
                console.error(error);
                setErrorSnackBarOpen(true);
            })
            .finally(() => setIsDeleting(false));
    };

    const handleConfirmationResult = (result: boolean) => {
        setConfirmDialogOpen(false);
        if (result) deleteApplication();
    };

    if (isDeleting) return <CircularProgress color="primary" />;

    return (
        <>
            {confirmDialogOpen ? (
                <ConfirmationDialog
                    title="Delete Application"
                    message={`Do you really want to delete the application "${application.name}"?`}
                    handleResult={handleConfirmationResult}
                />
            ) : null}
            <AlertSnackbar
                message="Could not delete Application."
                severity="error"
                open={errorSnackBarOpen}
                onClose={() => setErrorSnackBarOpen(false)}
            />
            <Tooltip title="Delete">
                <IconButton aria-label="delete" onClick={() => setConfirmDialogOpen(true)}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </>
    );
}
