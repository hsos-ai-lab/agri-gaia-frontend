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

import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import UploadIcon from '@mui/icons-material/Upload';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FileInput from '../common/FileInput';
import AlertSnackbar from '../common/AlertSnackbar';

import { MODELS_PATH } from '../../endpoints';

export default function ({ modelId }: { modelId: number }) {
    const keycloak = useKeycloak();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [gitlabToken, setGitlabToken] = useState('');
    const [attachments, setAttachments] = useState<FileList>();
    const [isPushing, setIsPushing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const closeDialog = () => {
        setDialogOpen(false);
        setGitlabToken('');
        setAttachments(undefined);
    };

    const pushModel = async () => {
        setIsPushing(true);

        const formData = new FormData();
        formData.append('gitlab_token', gitlabToken);
        Array.from(attachments ?? []).forEach((file) => {
            formData.append('files', file, file.name);
        });

        httpUpload(keycloak, `${MODELS_PATH}/${modelId}/push-to-gitlab`, formData)
            .then(() => {
                closeDialog();
            })
            .catch((error) => {
                setErrorMsg(error.body?.detail ?? 'Pushing the model to GitLab failed.');
            })
            .finally(() => {
                setIsPushing(false);
            });
    };

    return (
        <>
            <Tooltip title="Push to GitLab">
                <LoadingButton
                    color="primary"
                    aria-label="push to gitlab"
                    loading={isPushing}
                    onClick={() => setDialogOpen(true)}
                >
                    <UploadIcon />
                </LoadingButton>
            </Tooltip>
            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
                <DialogTitle>Push Model to GitLab</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a GitLab personal access token (with write_repository and
                        write_package scope) for the source ARC repository. It is used only for
                        this request and is not stored.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="GitLab Token"
                        type="password"
                        fullWidth
                        variant="standard"
                        value={gitlabToken}
                        onChange={(e) => setGitlabToken(e.target.value)}
                        disabled={isPushing}
                    />
                    <Box mt={2}>
                        <FileInput
                            text="Attach files"
                            accept=""
                            multiple={true}
                            onChange={setAttachments}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={isPushing}>
                        Cancel
                    </Button>
                    <LoadingButton onClick={pushModel} loading={isPushing} disabled={!gitlabToken}>
                        Push
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <AlertSnackbar
                message={errorMsg}
                severity="error"
                open={!!errorMsg}
                onClose={() => setErrorMsg(undefined)}
            />
        </>
    );
}
