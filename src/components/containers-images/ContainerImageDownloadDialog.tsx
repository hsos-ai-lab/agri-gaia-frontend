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

import React, { useState, useEffect } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { httpGet, httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Typography from '@mui/material/Typography';

import { CONTAINER_IMAGES_PATH } from '../../endpoints';

export default function ({ handleClose, onDownload }: { handleClose: () => void; onDownload: () => void }) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [username, setUsername] = useState<string | undefined>(undefined);

    const [containerImageName, setContainerImageName] = useState<string>('nginxdemos/hello');
    const [containerImageTag, setContainerImageTag] = useState<string>('latest');
    const [containerImageArch, setContainerImageArch] = useState<string>('linux/amd64');

    const [useDifferentImageName, setUseDifferentImageName] = useState<boolean>(false);
    const [containerImageNamePlattform, setContainerImageNamePlattform] = useState<string>('hello');
    const [containerImageTagPlattform, setContainerImageTagPlattform] = useState<string>('latest');

    const [downloadInProgress, setDownloadInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [downloadSuccess, setDownloadSuccess] = useState<boolean | undefined>(undefined);

    const fetchUsername = async () => {
        if (keycloak?.authenticated && username === undefined) {
            keycloak.loadUserProfile().then((profile: { username?: string }) => {
                setUsername(profile.username);
            });
        }
    };

    useEffect(() => {
        fetchUsername();
    }, [keycloak]);

    const handleDownloadButtonClick = async () => {
        if (downloadSuccessful()) {
            handleClose();
            return;
        }

        if (containerImageName.trim() === '') {
            setErrorMsg('Please specify a container image name!');
            return;
        }

        if (containerImageTag.trim() === '') {
            setErrorMsg('Please specify a container image tag!');
            return;
        }

        if (containerImageArch.trim() === '') {
            setErrorMsg('Please specify a container image arch in the format os[/arch[/version]]!');
            return;
        }

        setErrorMsg(undefined);
        setDownloadSuccess(false);
        setDownloadInProgresss(true);

        const repositoryNameEscaped = containerImageName.replaceAll('/', '___');
        const imageArchEscaped = containerImageArch.replaceAll('/', '_');

        const reqParams = new URLSearchParams();
        reqParams.append('target_repository', containerImageNamePlattform);
        reqParams.append('target_tag', containerImageTagPlattform);

        const path = `${CONTAINER_IMAGES_PATH}/download/${repositoryNameEscaped}/${containerImageTag}/${imageArchEscaped}?${reqParams}`;

        httpPost(keycloak, path, undefined, undefined, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => tasks?.addServerBackgroundTask(keycloak, tasks, task, () => onDownload()))
                    .catch(console.error);
                setErrorMsg(undefined);
                setDownloadSuccess(true);
            })
            .catch((error) => {
                setErrorMsg(error.message);
                setDownloadSuccess(false);
            })
            .finally(() => {
                setDownloadInProgresss(false);
            });
    };

    const isDownloading = () => {
        return downloadInProgress;
    };

    const downloadSuccessful = () => {
        return downloadSuccess;
    };

    const getButtonText = () => {
        if (isDownloading()) return 'Downloading';
        if (downloadSuccessful()) return 'Close';
        return 'Download';
    };

    const onClose = () => {
        if (isDownloading()) {
            return;
        }
        handleClose();
    };

    const handleContainerImageNameChange = (name: string) => {
        setContainerImageName(name);
        if (!useDifferentImageName) {
            const repo_parts = name.split('/');
            if (repo_parts.length > 1) {
                setContainerImageNamePlattform(repo_parts[1]);
            } else {
                setContainerImageNamePlattform(repo_parts[0]);
            }
        }
    };

    const handleContainerImageTagChange = (tag: string) => {
        setContainerImageTag(tag);
        if (!useDifferentImageName) {
            setContainerImageTagPlattform(tag);
        }
    };

    const handleUseDifferentImageNameChange = (checked: boolean) => {
        setUseDifferentImageName(checked);
        if (!checked) {
            const repo_parts = containerImageName.split('/');
            if (repo_parts.length > 1) {
                setContainerImageNamePlattform(repo_parts[1]);
            } else {
                setContainerImageNamePlattform(repo_parts[0]);
            }
            setContainerImageTagPlattform(containerImageTag);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Download Container Image</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid container direction="column">
                    <Grid item>
                        <Grid container direction="row" spacing={1} mt={2} sx={{ height: '55px' }}>
                            <Grid item xs={7}>
                                <TextField
                                    id="name-textfield"
                                    label="Repository"
                                    variant="standard"
                                    onChange={(e) => handleContainerImageNameChange(e.target.value)}
                                    value={containerImageName}
                                    required
                                    disabled={isDownloading()}
                                    style={{ width: '100%' }}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    id="tag-textfield"
                                    label="Tag"
                                    variant="standard"
                                    onChange={(e) => handleContainerImageTagChange(e.target.value)}
                                    value={containerImageTag}
                                    required
                                    disabled={isDownloading()}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="arch-textfield"
                                    label="Arch"
                                    variant="standard"
                                    onChange={(e) => setContainerImageArch(e.target.value)}
                                    value={containerImageArch}
                                    required
                                    disabled={isDownloading()}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item mt={4}>
                        <Box>
                            <Divider textAlign="left">Image name in plattform</Divider>
                        </Box>
                    </Grid>
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    id="different-image-name-checkbox"
                                    checked={useDifferentImageName} // Set to true or false based on the checked state
                                    onChange={(e) => handleUseDifferentImageNameChange(e.target.checked)} // Provide a function to handle the onChange event
                                    color="primary" // Specify the color of the checkbox
                                />
                            }
                            label="Use different image name"
                        />
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" spacing={1} mt={2} sx={{ height: '55px' }}>
                            <Grid item xs={7}>
                                <Stack direction="row">
                                    <Box sx={{ display: 'flex', alignItems: 'end' }}>
                                        <Typography pb={'4px'}>{username ? `${username}/` : 'N/A /'}</Typography>
                                    </Box>
                                    <TextField
                                        id="name-plattform-textfield"
                                        label="Repository Name Plattform"
                                        variant="standard"
                                        onChange={(e) => setContainerImageNamePlattform(e.target.value)}
                                        value={containerImageNamePlattform}
                                        required
                                        disabled={isDownloading() || !useDifferentImageName}
                                        style={{ width: '100%' }}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    id="tag-plattform-textfield"
                                    label="Tag"
                                    variant="standard"
                                    onChange={(e) => setContainerImageTagPlattform(e.target.value)}
                                    value={containerImageTagPlattform}
                                    required
                                    disabled={isDownloading() || !useDifferentImageName}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                {downloadSuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                <LoadingButton onClick={handleDownloadButtonClick} loading={isDownloading()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
