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
import useKeycloak from '../../contexts/KeycloakContext';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import IAlertMessage from '../../types/IAlertMessage';
import { AlertColor } from '@mui/material/Alert';

import { httpUpload } from '../../api';
import { TRAIN_CONFIG_UPLOAD_PATH } from '../../endpoints';

interface ITrainConfigUploadProps {
    provider: string;
    architecture: string;
    setTrainConfigValues: (trainConfigValues: unknown) => void;
    onUpload: (uploadMessage: IAlertMessage) => void;
    handleClose: () => void;
}

export default function ({
    provider,
    architecture,
    setTrainConfigValues,
    onUpload,
    handleClose,
}: ITrainConfigUploadProps) {
    const keycloak = useKeycloak();

    const [selectedConfigFile, setSelectedConfigFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const handleUploadButtonClick = async () => {
        setErrorMsg(undefined);

        if (!selectedConfigFile) {
            setErrorMsg('Please select a configuration file!');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('provider', provider);
        formData.append('architecture', architecture);
        formData.append('config_file', selectedConfigFile, selectedConfigFile.name);

        httpUpload(keycloak, TRAIN_CONFIG_UPLOAD_PATH, formData)
            .then((trainConfigValues: unknown) => {
                setErrorMsg(undefined);
                setTrainConfigValues(trainConfigValues);
                const uploadMessage = {
                    message: `Successfully uploaded configuration file for ${architecture} (${provider}).`,
                    severity: 'success' as AlertColor,
                    open: true,
                };
                onUpload(uploadMessage);
            })
            .catch((error) => {
                setErrorMsg(error.body.detail);
            })
            .finally(() => {
                setIsUploading(false);
                handleClose();
            });
    };

    const onClose = () => {
        if (isUploading) return;
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Train Configuration</DialogTitle>
            <DialogContent>
                {errorMsg ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                ) : null}
                <Typography>
                    Please select a previously saved JSON configuration file for {architecture} ({provider}).
                </Typography>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Grid item xs={12}>
                        <FileInput
                            text="Select Config"
                            accept="application/json"
                            multiple={false}
                            onChange={(files) => setSelectedConfigFile(files[0])}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleUploadButtonClick} loading={isUploading}>
                    Upload
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
