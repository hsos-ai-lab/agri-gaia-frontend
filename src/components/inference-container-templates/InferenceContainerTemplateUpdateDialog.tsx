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

import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { httpPatch } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import { INFERENCE_CONTAINER_TEMPLATES_PATH } from '../../endpoints';
import IInferenceContainerTemplate from '../../types/IInferenceContainerTemplate';
import TokenAuthenticationForm from './TokenAuthenticationForm';

interface RequestBody {
    git_ref: string;
    git_username?: string;
    git_access_token?: string;
}

export default function ({
    containerTemplate,
    onClose: notifyOnClose,
}: {
    containerTemplate: IInferenceContainerTemplate;
    onClose: () => void;
}) {
    const keycloak = useKeycloak();

    const [gitReference, setGitReference] = useState<string>(containerTemplate.git_ref || '');
    const [tokenAuthenticationFormData, setTokenAuthenticationFormData] = useState({
        gitUsername: '',
        gitAccessToken: '',
    });

    const [errorMsgs, setErrorMsgs] = useState<string[]>([]);
    const [tokenAuthFormErrors, setTokenAuthFormErrors] = useState<string[]>([]);
    const [updateInProgress, setUpdateInProgress] = useState(false);
    const [updateSuccess, setUpdateSucesss] = useState<boolean | undefined>(undefined);

    const isFormValid = () => {
        const validationErrors = [];
        if (!gitReference) {
            validationErrors.push('Please specify a git reference.');
        }
        validationErrors.push(...tokenAuthFormErrors);
        if (validationErrors.length > 0) {
            setErrorMsgs(validationErrors);
            return false;
        }
        setErrorMsgs([]);
        return true;
    };

    const createRequestBody = () => {
        const body: RequestBody = { git_ref: gitReference };
        if (tokenAuthenticationFormData.gitUsername) {
            body.git_username = tokenAuthenticationFormData.gitUsername;
        }
        if (tokenAuthenticationFormData.gitAccessToken) {
            body.git_access_token = tokenAuthenticationFormData.gitAccessToken;
        }
        return body;
    };

    const handleBuildButtonClick = async () => {
        if (updateSuccess) {
            notifyOnClose();
            return;
        }
        if (!isFormValid()) {
            return;
        }
        const body = createRequestBody();

        setUpdateInProgress(true);
        // send the request
        httpPatch(keycloak, `${INFERENCE_CONTAINER_TEMPLATES_PATH}/${containerTemplate.id}/update-from-git`, body)
            .then(() => {
                setErrorMsgs([]);
                setUpdateSucesss(true);
            })
            .catch((error) => {
                setErrorMsgs([error.body['detail']]);
                setUpdateSucesss(false);
            })
            .finally(() => {
                setUpdateInProgress(false);
            });
    };

    const handleGitAuthenticationFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTokenAuthenticationFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const isUpdating = () => {
        return updateInProgress;
    };

    const updateSucessful = () => {
        return updateSuccess;
    };

    const getButtonText = () => {
        if (isUpdating()) return 'Pulling version';
        if (updateSucessful()) return 'Close';
        return 'Pull latest version';
    };

    const onClose = () => {
        if (isUpdating()) {
            return;
        }
        notifyOnClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogTitle>Pull changes from remote git repository</DialogTitle>
            <Divider textAlign="left"></Divider>
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
                <Grid container direction="row" spacing={1} mt={2} mb={2}>
                    <Grid item xs={3}>
                        <b>Git Url:</b>
                    </Grid>
                    <Grid item xs={9}>
                        <a href={containerTemplate.git_url}>{containerTemplate.git_url}</a>
                    </Grid>
                </Grid>
                <Grid container direction="row" spacing={1} mt={2} mb={2}>
                    <Grid item xs={3} alignContent={'center'}>
                        <b>Git Reference:</b>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField
                            id="git-ref-textfield"
                            // label="Git Reference"
                            variant="outlined"
                            onChange={(e) => setGitReference(e.target.value)}
                            value={gitReference}
                            required
                            disabled={isUpdating()}
                            style={{ width: '100%' }}
                        />
                    </Grid>
                </Grid>
                <TokenAuthenticationForm
                    data={tokenAuthenticationFormData}
                    handleChange={handleGitAuthenticationFormChange}
                    onValidate={setTokenAuthFormErrors}
                    disabled={isUpdating()}
                />
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleBuildButtonClick} loading={isUpdating()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
