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

import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { AlertColor } from '@mui/material/Alert';
import { ReactNode } from 'react';

export default function ({
    message,
    severity,
    open,
    sticky = false,
    onClose,
    anchorOrigin = { vertical: 'top', horizontal: 'right' },
}: {
    message?: string | ReactNode;
    severity: AlertColor | undefined;
    open: boolean;
    sticky?: boolean;
    onClose: () => void;
    anchorOrigin?: SnackbarOrigin;
}) {
    return (
        <Snackbar anchorOrigin={anchorOrigin} open={open} autoHideDuration={sticky ? null : 4000} onClose={onClose}>
            <Alert severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}
