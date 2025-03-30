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
import { useNavigate } from 'react-router-dom';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { httpGet, httpPost } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import IModel from '../../types/IModel';
import IEdgeDevice from '../../types/IEdgeDevice';
import { MODELS_PATH, CONTAINER_IMAGES_PATH, EDGE_DEVICES_PATH } from '../../endpoints';
import { FormControlLabel, FormLabel } from '@mui/material';
import IInferenceContainerTemplate from '../../types/IInferenceContainerTemplate';

interface MissingPropertiesError {
    message: string;
    edgeDeviceProps: Array<string>;
    modelProps: Array<string>;
}

export default function ({
    containerTemplate,
    onClose: handleClose,
    onBuildCompleted,
}: {
    containerTemplate: IInferenceContainerTemplate;
    onClose: () => void;
    onBuildCompleted: () => void;
}) {
    const navigate = useNavigate();
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [username, setUsername] = useState<string | undefined>(undefined);
    const [containerImageName, setContainerImageName] = useState<string>('');
    const [containerImageTag, setContainerImageTag] = useState<string>('');
    const [models, setModels] = useState<Array<IModel>>([]);
    const [edgeDevices, setEdgeDevices] = useState<Array<IEdgeDevice>>([]);

    const [selectedModelId, setSelectedModelId] = useState<number | undefined>(undefined);
    const [selectedEdgeDeviceId, setSelectedEdgeDeviceId] = useState<number | undefined>(undefined);
    const [selectedHardwareArchitecture, setSelectedHardwareArchitecture] = useState<string | undefined>(undefined);

    const [buildInProgress, setBuildInProgress] = useState(false);

    const [buildError, setBuildError] = useState<MissingPropertiesError | undefined>(undefined);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [buildSuccess, setBuildSuccess] = useState<boolean | undefined>(undefined);

    const onEdgeDeviceSelected = (device_id: number | undefined) => {
        const edgeDevice: IEdgeDevice = edgeDevices.filter((edgeDevice: IEdgeDevice) => edgeDevice.id === device_id)[0];
        setSelectedHardwareArchitecture(edgeDevice.arch || undefined);
        setSelectedEdgeDeviceId(device_id);
    };

    const onHardwareArchitectureSelected = (hwArch: string) => {
        setSelectedEdgeDeviceId(undefined);
        setSelectedHardwareArchitecture(hwArch);
    };

    const fetchModels = async () => {
        httpGet(keycloak, MODELS_PATH)
            .then((data) => {
                setModels(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchEdgeDevices = async () => {
        httpGet(keycloak, EDGE_DEVICES_PATH)
            .then((data) => {
                setEdgeDevices(data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchUsername = async () => {
        if (keycloak?.authenticated && username === undefined) {
            keycloak.loadUserProfile().then((profile: { username?: string }) => {
                setUsername(profile.username);
            });
        }
    };

    useEffect(() => {
        fetchModels();
        fetchEdgeDevices();
        fetchUsername();
    }, [keycloak]);

    const handleBuildButtonClick = async () => {
        if (buildSuccessful()) {
            handleClose();
            return;
        }

        // validate generic (e.g. inference service type independent) inputs
        if (containerImageName.trim() === '') {
            setErrorMsg('Please specify an image name!');
            return;
        }

        if (containerImageTag.trim() === '') {
            setErrorMsg('Please specify an image tag!');
            return;
        }

        if (selectedModelId === undefined) {
            setErrorMsg('Please select a model!');
            return;
        }
        if (selectedEdgeDeviceId === undefined && selectedHardwareArchitecture === undefined) {
            setErrorMsg('Please select an edge device or hardware architecture!');
            return undefined;
        }

        // create the request body
        const requestBody: any = {
            container_template_id: containerTemplate.id,
            repository: `${username}/${containerImageName.trim()}`,
            tag: containerImageTag.trim(),
            model_id: selectedModelId,
            edge_device_id: selectedEdgeDeviceId,
            architecture: selectedEdgeDeviceId === undefined ? selectedHardwareArchitecture : undefined,
        };

        if (requestBody === undefined) {
            return;
        }
        setErrorMsg(undefined);
        setBuildSuccess(false);
        setBuildInProgress(true);

        // send the request
        httpPost(keycloak, `${CONTAINER_IMAGES_PATH}/build`, requestBody, {}, true)
            .then(({ headers }) => {
                httpGet(keycloak, headers.get('Location'))
                    .then((task) => tasks?.addServerBackgroundTask(keycloak, tasks, task, () => onBuildCompleted()))
                    .catch(console.error);
                setErrorMsg(undefined);
                setBuildSuccess(true);
            })
            .catch((error) => {
                if (error.body) {
                    setErrorMsg('Container Image build failed!');
                    console.log(error.body);
                    if ('exception_type' in error.body) {
                        if (error.body.exception_type === 'MissingInputDataException') {
                            setBuildError({
                                message: error.body.detail,
                                edgeDeviceProps: error.body.body.device,
                                modelProps: error.body.body.model,
                            });
                        }
                    }
                } else {
                    setErrorMsg(error.message);
                }
                setBuildSuccess(false);
            })
            .finally(() => {
                setBuildInProgress(false);
            });
    };

    const isBuilding = () => {
        return buildInProgress;
    };

    const buildSuccessful = () => {
        return buildSuccess;
    };

    const getButtonText = () => {
        if (isBuilding()) return 'Building';
        if (buildSuccessful()) return 'Close';
        return 'Build';
    };

    const onClose = () => {
        if (isBuilding()) {
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogTitle>Build Inference Service Image</DialogTitle>
            <DialogContent>
                {errorMsg ? (
                    <Box sx={{ width: '100%' }}>
                        <Alert severity="error">{errorMsg}</Alert>
                    </Box>
                ) : null}
                {buildError ? (
                    <Grid container direction="column">
                        <Grid item>
                            <Grid container direction="row" mt={2}>
                                <Grid item xs={4}>
                                    <b>Reason:</b>
                                </Grid>
                                <Grid item xs={8}>
                                    {buildError.message}
                                </Grid>
                            </Grid>
                        </Grid>
                        {buildError.edgeDeviceProps.length > 0 ? (
                            <Grid item>
                                <Grid container direction="row" mt={2}>
                                    <Grid item xs={4}>
                                        <b>Missing Edge Device Properties:</b>
                                    </Grid>
                                    <Grid item xs={8}>
                                        {buildError.edgeDeviceProps.join(', ')}
                                    </Grid>
                                </Grid>
                            </Grid>
                        ) : null}
                        {buildError.modelProps.length > 0 ? (
                            <Grid item>
                                <Grid container direction="row">
                                    <Grid item xs={4}>
                                        <b>Missing Model Properties:</b>
                                    </Grid>
                                    <Grid item xs={8}>
                                        {buildError.modelProps.join(', ')}
                                    </Grid>
                                </Grid>
                                <Grid item my={2}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate(`/models/${selectedModelId}`)}
                                    >
                                        Go to Model Details
                                    </Button>
                                </Grid>
                            </Grid>
                        ) : null}
                        <Divider />
                    </Grid>
                ) : null}
                <Grid container direction="row" spacing={1} mt={2} sx={{ height: '55px' }}>
                    <Grid item xs={7}>
                        <Stack direction="row">
                            <Box sx={{ display: 'flex', alignItems: 'end' }}>
                                <Typography pb={'4px'}>{username ? `${username}/` : 'N/A /'}</Typography>
                            </Box>
                            <TextField
                                id="name-textfield"
                                label="Name"
                                variant="standard"
                                onChange={(e) => setContainerImageName(e.target.value)}
                                value={containerImageName}
                                required
                                disabled={isBuilding()}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={5}>
                        <TextField
                            id="tag-textfield"
                            label="Tag"
                            variant="standard"
                            onChange={(e) => setContainerImageTag(e.target.value)}
                            value={containerImageTag}
                            required
                            disabled={isBuilding()}
                        />
                    </Grid>
                </Grid>
                <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel id="models">Model</InputLabel>
                            <Select
                                labelId="models"
                                id="models-select"
                                value={selectedModelId === undefined ? '' : selectedModelId.toString()}
                                label="Model"
                                onChange={(event: SelectChangeEvent) => {
                                    setSelectedModelId(Number(event.target.value) || undefined);
                                }}
                            >
                                {models.map((model) => (
                                    <MenuItem key={model.id} value={model.id}>
                                        {model.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid container justifyContent="space-between" direction="row" mt={4} sx={{ height: '50px' }}>
                    <Grid item xs={5}>
                        <FormControl fullWidth>
                            <InputLabel id="edge-devices">Edge Device</InputLabel>
                            <Select
                                labelId="edge-devices"
                                id="edge-device-select"
                                value={selectedEdgeDeviceId === undefined ? '' : selectedEdgeDeviceId.toString()}
                                label="Edge Device"
                                onChange={(event: SelectChangeEvent) => {
                                    onEdgeDeviceSelected(Number(event.target.value) || undefined);
                                }}
                            >
                                {edgeDevices.map((device) => (
                                    <MenuItem key={device.id} value={device.id} disabled={!device.registered}>
                                        {device.name}
                                        {!device.registered ? ' (not registered)' : null}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={5}>
                        <FormControl fullWidth>
                            <InputLabel id="device-architecture">Device Architecture</InputLabel>
                            <Select
                                labelId="hardware-architecture"
                                id="hardware-architecture-select"
                                value={selectedHardwareArchitecture === undefined ? '' : selectedHardwareArchitecture}
                                label="Device Architecture"
                                onChange={(event: SelectChangeEvent) => {
                                    onHardwareArchitectureSelected(event.target.value);
                                }}
                            >
                                <MenuItem key={'arm64'} value={'arm64'}>
                                    {'arm64'}
                                </MenuItem>
                                <MenuItem key={'amd64'} value={'amd64'}>
                                    {'amd64'}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton onClick={handleBuildButtonClick} loading={isBuilding()}>
                    {getButtonText()}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
