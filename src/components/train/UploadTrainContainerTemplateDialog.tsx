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
import Link from '@mui/material/Link';
import IAlertMessage from '../../types/IAlertMessage';
import ITrainContainerTemplateInfo from '../../types/ITrainContainerTemplateInfo';
import { AlertColor } from '@mui/material/Alert';

import { httpUpload } from '../../api';
import { TRAIN_TEMPLATE_UPLOAD_PATH } from '../../endpoints';

interface ITrainContainerTemplateUploadProps {
    handleClose: () => void;
    onUpload: (uploadMessage: IAlertMessage, templateInfo: ITrainContainerTemplateInfo) => void;
}

export default function ({ handleClose, onUpload }: ITrainContainerTemplateUploadProps) {
    const keycloak = useKeycloak();

    const [selectedTemplateZip, setSelectedTemplateZip] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const handleUploadButtonClick = async () => {
        setErrorMsg(undefined);

        if (!selectedTemplateZip) {
            setErrorMsg('Please select a template ZIP archive!');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('template_zip', selectedTemplateZip, selectedTemplateZip.name);

        await httpUpload(keycloak, TRAIN_TEMPLATE_UPLOAD_PATH, formData)
            .then((templateInfo) => {
                setErrorMsg(undefined);
                const uploadMessage = {
                    message: `Successfully uploaded ${templateInfo.architecture.name} (${templateInfo.provider})`,
                    severity: 'success' as AlertColor,
                    open: true,
                };
                onUpload(uploadMessage, templateInfo);
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
        <>
            <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Upload Train Container Template</DialogTitle>
                <DialogContent>
                    {errorMsg ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errorMsg}
                        </Alert>
                    ) : null}
                    <Typography>
                        Please select a ZIP archive generated with the Agri-Gaia Train Container Template's{' '}
                        <Link
                            href="https://github.com/agri-gaia/train-container-template/blob/master/package.sh"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <code>package.sh</code>
                        </Link>{' '}
                        script.
                    </Typography>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={12}>
                            <FileInput
                                text="Select Template"
                                accept="application/zip"
                                multiple={false}
                                onChange={(files) => setSelectedTemplateZip(files[0])}
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
        </>
    );
}
