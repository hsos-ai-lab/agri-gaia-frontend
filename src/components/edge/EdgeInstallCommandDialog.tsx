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

import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { getEdgeInstallCommand } from '../../util';
import IEdgeDevice from '../../types/IEdgeDevice';

export default function EdgeInstallCommandDialog({
    edgeDevice,
    handleClose,
}: {
    edgeDevice: IEdgeDevice;
    handleClose: () => void;
}) {
    const edgeInstallCommand = getEdgeInstallCommand(edgeDevice.edge_key);
    return (
        <Dialog open={true} onClose={handleClose} maxWidth="xl">
            <DialogTitle>Edge Device Install Command</DialogTitle>
            <DialogContent>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <p>Run this on your Edge Device:</p>
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={() => navigator.clipboard.writeText(edgeInstallCommand)}
                            startIcon={<ContentCopyIcon />}
                        >
                            Copy to Clipboard
                        </Button>
                    </Grid>
                </Grid>
                <Alert severity="success">
                    <code style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{edgeInstallCommand}</code>
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
