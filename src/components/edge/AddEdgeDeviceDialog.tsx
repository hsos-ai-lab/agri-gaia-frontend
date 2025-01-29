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

import React, { useState, useEffect } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { EDGE_DEVICES_PATH } from '../../endpoints';
import { getEdgeInstallCommand } from '../../util';
import IEdgeDevice from '../../types/IEdgeDevice';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import ITag from '../../types/ITag';

const filter = createFilterOptions<string>();

export default function AddEdgeDeviceDialog({ tags, handleClose }: { tags: Array<ITag>; handleClose: () => void }) {
    const keycloak = useKeycloak();

    const [edgeDeviceName, setEdgeDeviceName] = useState('');
    const [selectedTags, setSelectedTags] = useState<Array<string>>([]);

    const [createdEdgeDevice, setCreatedEdgeDevice] = useState<IEdgeDevice | undefined>(undefined);
    const [edgeInstallCommand, setEdgeInstallCommand] = useState<string | undefined>(undefined);
    useEffect(
        () => setEdgeInstallCommand(createdEdgeDevice ? getEdgeInstallCommand(createdEdgeDevice.edge_key) : undefined),
        [createdEdgeDevice],
    );

    const [edgeDeviceInProgress, setEdgeDeviceInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [edgeDeviceError, setEdgeDeviceError] = useState<string | undefined>(undefined);
    const [edgeDeviceSuccess, setEdgeDeviceSuccess] = useState<boolean | undefined>(undefined);

    const handleAddEdgeDeviceButtonClick = async () => {
        if (addEdgeDeviceSuccessful()) {
            handleClose();
            return;
        }

        if (edgeDeviceName.trim() === '') {
            setErrorMsg('Please specify an edge device name!');
            return;
        }
        setErrorMsg(undefined);
        setEdgeDeviceSuccess(false);
        setEdgeDeviceError(undefined);
        setEdgeDeviceInProgresss(true);

        httpPost(keycloak, EDGE_DEVICES_PATH, {
            name: edgeDeviceName.trim().replaceAll(' ', '-'),
            tags: selectedTags,
        })
            .then((data) => {
                setCreatedEdgeDevice(data);
                setEdgeDeviceSuccess(true);
                console.log('edge device: ' + createdEdgeDevice);
                if (createdEdgeDevice) {
                    setEdgeInstallCommand(getEdgeInstallCommand(createdEdgeDevice.edge_key));
                }
            })
            .catch((error) => {
                console.error(error);
                const detail = error?.body?.detail;
                if (detail) setEdgeDeviceError(detail);
                else setEdgeDeviceError(error.message);
            })
            .finally(() => {
                setEdgeDeviceInProgresss(false);
            });
    };

    const isCreating = () => {
        return edgeDeviceInProgress;
    };

    const addEdgeDeviceSuccessful = () => {
        return edgeDeviceSuccess;
    };

    const getButtonText = () => {
        if (isCreating()) return 'Adding';
        if (addEdgeDeviceSuccessful()) return 'Close';
        return 'Add';
    };

    const onClose = () => {
        if (isCreating()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth={edgeDeviceSuccess ? 'xl' : 'xs'}>
            <DialogTitle>Add Edge Device</DialogTitle>
            <DialogContent>
                {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                <Grid direction="column" container spacing={3}>
                    <Grid item>
                        <TextField
                            id="name-textfield"
                            label="Name"
                            variant="standard"
                            onChange={(e) => setEdgeDeviceName(e.target.value)}
                            value={edgeDeviceName}
                            required
                            disabled={isCreating() || edgeDeviceSuccess}
                            fullWidth
                        />
                    </Grid>
                    <Grid item>
                        <Autocomplete
                            multiple
                            freeSolo
                            id="tags-autocomplete"
                            disabled={isCreating() || edgeDeviceSuccess}
                            options={tags.map((t) => t.name)}
                            getOptionLabel={(option) => {
                                if (
                                    tags.findIndex((t) => t.name === option) > -1 ||
                                    selectedTags.indexOf(option) > -1
                                ) {
                                    return option;
                                }
                                // new option
                                return `Add "${option}"`;
                            }}
                            renderInput={(params) => <TextField {...params} variant="standard" label="Tags" />}
                            onChange={(event, newValue) => {
                                setSelectedTags([...newValue]);
                            }}
                            value={selectedTags}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);

                                const { inputValue } = params;
                                // Suggest the creation of a new value
                                const isExisting = options.some((option) => inputValue === option);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push(inputValue);
                                }

                                return filtered;
                            }}
                        />
                    </Grid>
                </Grid>
                {edgeDeviceError ? <Alert severity="error">{edgeDeviceError}</Alert> : null}
                {createdEdgeDevice && edgeInstallCommand ? (
                    <>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <p>Run this on your Edge Device:</p>
                            </Grid>
                            <Grid item>
                                <Button
                                    onClick={() => navigator.clipboard.writeText(edgeInstallCommand)}
                                    startIcon={<ContentCopyIcon />}
                                >
                                    Copy to Clipboard
                                </Button>
                            </Grid>
                        </Grid>
                        <Alert severity="success">
                            <code style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{edgeInstallCommand}</code>
                        </Alert>{' '}
                    </>
                ) : null}
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleAddEdgeDeviceButtonClick} loading={isCreating()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
