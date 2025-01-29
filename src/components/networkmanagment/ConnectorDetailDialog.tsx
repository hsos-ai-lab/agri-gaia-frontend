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

import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

interface IDatasetUploadProps {
    handleClose: () => void;
    ownInformation: any;
}

export default function ({ handleClose, ownInformation }: IDatasetUploadProps) {
    return (
        <Dialog open={true} onClose={handleClose} fullWidth={true} maxWidth="sm">
            <DialogTitle>Connector Information</DialogTitle>
            <DialogContent>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Typography>Data Url: {ownInformation['connector_data_url']}</Typography>
                </Grid>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Typography>IDS Url: {ownInformation['connector_ids_url']}</Typography>
                </Grid>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Typography>MinIO Url: {ownInformation['minio_url']}</Typography>
                </Grid>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Typography>Password: {ownInformation['password']}</Typography>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleClose} loading={false}>
                    Close
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
