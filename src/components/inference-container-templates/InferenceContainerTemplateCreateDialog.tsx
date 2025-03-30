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

import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Alert from '@mui/material/Alert';
import { FormControlLabel } from '@mui/material';

import { httpUpload } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import FileInput from '../common/FileInput';
import { INFERENCE_CONTAINER_TEMPLATES_PATH } from '../../endpoints';
import TokenAuthenticationForm from './TokenAuthenticationForm';

const https_regex = /https:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

export default function ({ onClose: notifyOnClose }: { onClose: () => void }) {
    const keycloak = useKeycloak();

    const [containerTemplateName, setContainerTemplateName] = useState<string>('');
    const [containerTemplateDescription, setContainerTemplateDescription] = useState<string>('');
    const [createMethod, setCreateMethod] = useState<string>('upload');

    const [zipFile, setZipFile] = useState<File | undefined>(undefined);
    const [gitUrl, setGitUrl] = useState<string>('');
    const [gitReference, setGitReference] = useState<string>('main');
    const [tokenAuthenticationFormData, setTokenAuthenticationFormData] = useState({
        gitUsername: '',
        gitAccessToken: '',
    });

    const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
    const [tokenAuthFormErrors, setTokenAuthFormErrors] = useState<string[]>([]);
    const [createInProgress, setCreateInProgress] = useState(false);
    const [createSuccess, setCreateSuccess] = useState<boolean>(false);

    const isFormValid = () => {
        const validationErrors = [];
        if (!containerTemplateName) {
            validationErrors.push('Please specify a container template name');
        }
        if (createMethod == 'upload' && !zipFile) {
            validationErrors.push('Please specify an upload file!');
        }
        if (createMethod == 'git') {
            if (!gitUrl.match(https_regex)) {
                console.log(gitUrl);
                validationErrors.push('Please specify a valid https git url!');
            }
            if (!gitReference) {
                validationErrors.push('Please specify a git reference!');
            }
            validationErrors.push(...tokenAuthFormErrors);
        }
        if (validationErrors.length > 0) {
            setErrorMsgs(validationErrors);
            return false;
        }
        setErrorMsgs([]);
        return true;
    };

    const createFormData = () => {
        const formData = new FormData();
        formData.append('name', containerTemplateName);
        formData.append('description', containerTemplateDescription);

        if (createMethod === 'upload' && zipFile) {
            formData.append('file', zipFile, zipFile?.name);
        }
        if (createMethod === 'git') {
            formData.append('git_url', gitUrl);
            formData.append('git_ref', gitReference);
            if (tokenAuthenticationFormData.gitUsername) {
                formData.append('git_username', tokenAuthenticationFormData.gitUsername);
            }
            if (tokenAuthenticationFormData.gitAccessToken) {
                formData.append('git_access_token', tokenAuthenticationFormData.gitAccessToken);
            }
        }
        return formData;
    };

    const handleCreateButtonClick = async () => {
        if (createSuccess) {
            notifyOnClose();
            return;
        }
        if (!isFormValid()) {
            return;
        }
        const formData = createFormData();

        setCreateInProgress(true);
        httpUpload(keycloak, `${INFERENCE_CONTAINER_TEMPLATES_PATH}/create/${createMethod}`, formData)
            .then(() => {
                setErrorMsgs([]);
                setCreateSuccess(true);
            })
            .catch((error) => {
                if (error.status == 422) {
                    setErrorMsgs(['422 Unprocessable Entity']);
                } else {
                    setErrorMsgs([error.body['detail']]);
                }
            })
            .finally(() => {
                setCreateInProgress(false);
            });
    };

    const handleGitAuthenticationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTokenAuthenticationFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const isCreating = () => {
        return createInProgress;
    };

    const getButtonText = () => {
        if (isCreating()) return 'Creating';
        if (createSuccess) return 'Close';
        return 'Create';
    };

    const onClose = () => {
        if (isCreating()) {
            return;
        }
        notifyOnClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogTitle>Create Inference Container Template</DialogTitle>
            <DialogContent>
                {errorMsgs.length > 0 ? (
                    <Box sx={{ width: '100%' }} mb={2}>
                        {errorMsgs.map((error, index) => (
                            <Alert key={index} severity="error">
                                {error}
                            </Alert>
                        ))}
                    </Box>
                ) : null}
                <Box mb={2}>
                    <Divider textAlign="left">General Information</Divider>
                </Box>
                <Grid container direction="column" spacing={2} mt={1} mb={1}>
                    <Grid item>
                        <TextField
                            id="container-template-name-textfield"
                            label="Container Template Name"
                            variant="outlined"
                            onChange={(e) => setContainerTemplateName(e.target.value)}
                            value={containerTemplateName}
                            required
                            fullWidth
                            disabled={isCreating()}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="container-template-descrption-textfield"
                            label="Container Template Description"
                            variant="outlined"
                            onChange={(e) => setContainerTemplateDescription(e.target.value)}
                            value={containerTemplateDescription}
                            fullWidth
                            disabled={isCreating()}
                        />
                    </Grid>
                </Grid>
                <Box mt={2}>
                    <Divider textAlign="left">File Upload</Divider>
                </Box>
                <RadioGroup value={createMethod} onChange={(e) => setCreateMethod(e.target.value)}>
                    <Grid container direction="row" spacing={1} mt={2}>
                        <Grid item xs={6}>
                            <FormControlLabel value="upload" control={<Radio />} label="Upload Zip File" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel value="git" control={<Radio />} label="Use GitHub Repository" />
                        </Grid>
                    </Grid>
                </RadioGroup>
                <Grid container direction="column" spacing={2} mt={3} mb={1}>
                    {createMethod === 'upload' ? (
                        <Grid item>
                            <FileInput
                                text="Select Zip file"
                                accept=".zip"
                                multiple={false}
                                onChange={(files) => {
                                    if (!files || files.length != 1) {
                                        return;
                                    }
                                    setZipFile(files[0]);
                                }}
                            />
                        </Grid>
                    ) : null}
                    {createMethod === 'git' ? (
                        <>
                            <Grid item>
                                <TextField
                                    id="git-url-textfield"
                                    label="Git Url"
                                    variant="outlined"
                                    onChange={(e) => setGitUrl(e.target.value)}
                                    value={gitUrl}
                                    required
                                    fullWidth
                                    disabled={isCreating()}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    id="git-url-textfield"
                                    label="Git Reference"
                                    variant="outlined"
                                    onChange={(e) => setGitReference(e.target.value)}
                                    value={gitReference}
                                    required
                                    fullWidth
                                    disabled={isCreating()}
                                />
                            </Grid>
                            <Grid item>
                                <TokenAuthenticationForm
                                    data={tokenAuthenticationFormData}
                                    handleChange={handleGitAuthenticationFormChange}
                                    onValidate={setTokenAuthFormErrors}
                                    disabled={isCreating()}
                                />
                            </Grid>
                        </>
                    ) : null}
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleCreateButtonClick} loading={isCreating()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
