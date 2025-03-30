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

import { httpUpload } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import FileInput from '../common/FileInput';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

import { INTEGRATED_SERVICES_PATH } from '../../endpoints';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React from 'react';

const ALPHA_NUMERIC_DASH_REGEX = /^[a-zA-Z0-9-]+$/;
interface IServiceUploadProps {
    handleClose: () => void;
}

export default function UploadServiceDialog({ handleClose }: IServiceUploadProps) {
    const keycloak = useKeycloak();

    const [uploadFile, setUploadFile] = useState<FileList | string>();
    const [serviceTitle, setServiceTitle] = useState<string>('');
    const [alignment, setAlignment] = React.useState('file');

    const [createInProgress, setCreateInProgress] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [successMsg, setSuccessMsg] = useState<string | undefined>(undefined);

    const uploadServiceDefinition = async () => {
        if (uploadSuccessful()) {
            handleClose();
            return;
        }

        if (!uploadFile || !uploadFile.length) {
            setErrorMsg('Please select a API description file!');
            return;
        }
        if (serviceTitle.trim() === '') {
            setErrorMsg('Please specify a service name!');
            return;
        }

        setErrorMsg(undefined);
        setSuccessMsg(undefined);

        setCreateInProgress(true);

        const formData = new FormData();
        if (typeof uploadFile == 'string') {
            formData.append('link', uploadFile);
        } else {
            for (const file of Array.from(uploadFile)) formData.append('files', file, file.name);
        }

        formData.append('name', serviceTitle.trim());

        console.log(formData);

        httpUpload(keycloak, `${INTEGRATED_SERVICES_PATH}/uploadService`, formData)
            .then((response) => {
                setErrorMsg(undefined);
                setSuccessMsg(response);
            })
            .catch((error) => {
                if (error.body == undefined || error.body == null) {
                    setErrorMsg(error.message);
                } else {
                    setErrorMsg(error.message + ': ' + error.body.detail);
                }
                setSuccessMsg(undefined);
            })
            .finally(() => {
                setCreateInProgress(false);
            });
        //handleClose();
    };

    const isUploading = () => {
        return createInProgress;
    };

    const uploadSuccessful = () => {
        return successMsg ? true : false;
    };

    const getButtonText = () => {
        if (isUploading()) return 'Uploading';

        if (uploadSuccessful()) return 'Close';

        return 'Create';
    };

    const onClose = () => {
        if (isUploading()) {
            return;
        }
        handleClose();
    };

    const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
        setAlignment(newAlignment);
    };

    return (
        <>
            <Dialog open={true} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle textAlign={'center'}>{`Upload ${name} Service`}</DialogTitle>
                <DialogContent>
                    <Grid direction="column" container spacing={3}>
                        <Grid item xs={10}>
                            <TextField
                                id="title-textfield"
                                label="Title"
                                variant="standard"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value !== '' && !ALPHA_NUMERIC_DASH_REGEX.test(value)) {
                                        return;
                                    }
                                    setServiceTitle(e.target.value);
                                }}
                                value={serviceTitle}
                                required
                                //disabled={isUploading()}
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={alignment}
                                    exclusive
                                    onChange={handleChange}
                                    aria-label="Platform"
                                    size="small"
                                    sx={{ height: 25 }}
                                >
                                    <ToggleButton value="file">File</ToggleButton>
                                    <ToggleButton value="link">Link</ToggleButton>
                                </ToggleButtonGroup>
                                &nbsp; &nbsp;
                                {alignment == 'file' ? (
                                    <FileInput
                                        text="Select Files"
                                        accept=".json, .yaml ,.yml"
                                        multiple={false}
                                        onChange={(files) => setUploadFile(files)}
                                    />
                                ) : (
                                    <TextField
                                        id="Link"
                                        name="Link"
                                        type="url"
                                        variant="standard"
                                        onChange={(e) => {
                                            setUploadFile(e.target.value);
                                        }}
                                        //fullWidth
                                        disabled={createInProgress || successMsg != undefined}
                                        style={{ marginBottom: '10px' }}
                                        value={uploadFile && typeof uploadFile == 'string' ? uploadFile : ''}
                                        InputLabelProps={{ shrink: true }}
                                    ></TextField>
                                )}
                            </div>
                        </Grid>
                    </Grid>
                    <DialogActions>
                        {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                        {successMsg ? <Alert>{successMsg}</Alert> : null}
                        <LoadingButton onClick={uploadServiceDefinition} disabled={!uploadFile} loading={isUploading()}>
                            {getButtonText()}
                        </LoadingButton>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
}
