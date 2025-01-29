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
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { httpUpload } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import { DATASETS_PATH } from '../../endpoints';

interface IDatasetImportProps {
    handleClose: () => void;
}

export default function ({ handleClose }: IDatasetImportProps) {
    const keycloak = useKeycloak();

    const [selectedDatasetFiles, setSelectedDatasetFiles] = useState<FileList>();

    const [createInProgress, setCreateInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [createSuccess, setCreateSuccess] = useState<boolean | undefined>(undefined);

    const handleUploadButtonClick = async () => {
        if (uploadSuccessful()) {
            handleClose();
            return;
        }

        if (!selectedDatasetFiles || !selectedDatasetFiles.length) {
            setErrorMsg('Please select a dataset file!');
            return;
        }

        // clear status
        setErrorMsg(undefined);
        setCreateSuccess(false);

        setCreateInProgresss(true);

        const formData = new FormData();

        for (const file of Array.from(selectedDatasetFiles)) formData.append('files', file, file.name);

        httpUpload(keycloak, DATASETS_PATH + '/import', formData)
            .then(() => {
                setErrorMsg(undefined);
                setCreateSuccess(true);
            })
            .catch((error) => {
                setErrorMsg(error.body['detail']);
                setCreateSuccess(false);
            })
            .finally(() => {
                setCreateInProgresss(false);
            });
    };

    const isUploading = () => {
        return createInProgress;
    };

    const uploadSuccessful = () => {
        return createSuccess;
    };

    const getButtonText = () => {
        if (isUploading()) return 'Uploading';

        if (uploadSuccessful()) return 'Close';

        return 'Import';
    };

    const onClose = () => {
        if (isUploading()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth="xs">
            <DialogTitle>Create new Dataset</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid item xs={8}>
                    <Box>
                        <Divider textAlign="left">Zipfile Upload</Divider>
                    </Box>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <FileInput
                                text="Select Files"
                                accept="*"
                                multiple={true}
                                onChange={(files) => setSelectedDatasetFiles(files)}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                            {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleUploadButtonClick} loading={isUploading()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
