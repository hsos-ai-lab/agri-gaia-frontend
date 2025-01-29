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
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import FileInput from '../common/FileInput';
import { httpUpload } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import AgrovocKeyword from '../../types/AgrovocKeyword';
import AgrovocKeywordSelector from '../../components/common/AgrovocKeywordSelector';
import { inferModelFormat } from '../../util';

import { MODEL_FORMATS } from '../../types/IModel';
import { MODELS_PATH } from '../../endpoints';

export default function ({ handleClose }: { handleClose: () => void }) {
    const keycloak = useKeycloak();

    const [modelName, setModelName] = useState('');
    const [modelFormat, setModelFormat] = useState('');
    const [modelDescription, setModelDescription] = useState<string>('');

    const [selectedModelFile, setSelectedModelFile] = useState<FileList>();
    const [chosenKeywords, setChosenKeywords] = useState<Array<AgrovocKeyword>>([]);

    const [createInProgress, setCreateInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [createSuccess, setCreateSuccess] = useState<boolean | undefined>(undefined);

    const handleModelFileChange = (files: FileList) => {
        setSelectedModelFile(files);
        const filenameParts = files[0].name.split('.');
        if (filenameParts.length > 1) {
            const fileExtension = filenameParts.pop();
            if (fileExtension) {
                const modelFormat = inferModelFormat(fileExtension);
                if (modelFormat) {
                    setModelFormat(modelFormat);
                }
            }
        }
    };

    const handleUploadButtonClick = async () => {
        if (uploadSuccessful()) {
            handleClose();
            return;
        }

        if (modelName.trim() === '') {
            setErrorMsg('Please specify a model name!');
            return;
        }
        if (modelDescription.trim() === '') {
            setErrorMsg('Please specify a model description!');
            return;
        }
        if (!selectedModelFile) {
            setErrorMsg('Please select a model to upload!');
            return;
        }
        if (!modelFormat) {
            setErrorMsg('Please select a model format!');
            return;
        }

        setErrorMsg(undefined);
        setCreateSuccess(false);

        if (selectedModelFile && selectedModelFile.length === 1) {
            setCreateInProgresss(true);

            const formData = new FormData();

            formData.append('modelfile', selectedModelFile[0], selectedModelFile[0].name);
            Array.from(chosenKeywords).forEach((el: AgrovocKeyword) => {
                formData.append('labels', el.uri);
            });
            formData.append('description', modelDescription);
            formData.append('name', modelName.trim());
            formData.append('format', modelFormat);

            httpUpload(keycloak, `${MODELS_PATH}`, formData)
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
        }
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
        return 'Upload';
    };

    const onClose = () => {
        if (isUploading()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Upload Model</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Box mt={1}>
                    <Divider textAlign="left">General Information</Divider>
                </Box>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Grid item xs={10}>
                        <TextField
                            id="name-textfield"
                            label="Name"
                            variant="standard"
                            onChange={(e) => setModelName(e.target.value)}
                            value={modelName}
                            required
                            // error={!modelName}
                            // helperText={!modelName ? 'Name is required!' : ''}
                            disabled={isUploading()}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                        {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                    </Grid>
                </Grid>
                <Grid container direction="row" mt={2}>
                    <Grid item xs={10}>
                        <TextField
                            id="desciption-textfield"
                            label="Description"
                            variant="standard"
                            multiline
                            maxRows={4}
                            onChange={(e) => setModelDescription(e.target.value)}
                            value={modelDescription}
                            required
                            // error={!modelDescription}
                            // helperText={!modelDescription ? 'Description is required!' : ''}
                            disabled={isUploading()}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                        {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <Divider textAlign="left">File Upload</Divider>
                </Box>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Grid item xs={10}>
                        <FileInput text="Select model" accept="" multiple={false} onChange={handleModelFileChange} />
                    </Grid>
                    <Grid item xs={2}>
                        {createInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                        {createSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <Divider textAlign="left">Additional Information</Divider>
                </Box>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Grid item xs={8}>
                        <FormControl fullWidth variant="standard">
                            <InputLabel id="demo-simple-select-helper-label">Model Format</InputLabel>
                            <Select
                                labelId="model-format-select"
                                id="model-format-select"
                                value={modelFormat}
                                label="Model Format"
                                onChange={(e) => setModelFormat(e.target.value)}
                            >
                                {MODEL_FORMATS.map((format) => (
                                    <MenuItem key={format.value} value={format.value}>
                                        {format.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <AgrovocKeywordSelector
                    chosenKeywords={chosenKeywords}
                    setChosenKeywords={setChosenKeywords}
                    isUploading={isUploading}
                />
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleUploadButtonClick} loading={isUploading()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
