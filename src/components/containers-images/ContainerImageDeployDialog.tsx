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

import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';

import useKeycloak from '../../contexts/KeycloakContext';
import useApplicationTasks from '../../contexts/TasksContext';
import ContainerDeployPortBinding from './ContainerImageDeployPortBinding';

import IEdgeDevice from '../../types/IEdgeDevice';
import IContainerDeploymentCreate from '../../types/IContainerDeploymentCreate';

import { httpGet, httpPost, httpPut } from '../../api';
import { EDGE_DEVICES_PATH, CONTAINER_DEPLOYMENTS_PATH } from '../../endpoints';
import IContainerImage from '../../types/IContainerImage';
import { IPortBindingKeys } from '../../types/IPortBinding';

export default function ContainerDeployDialog({
    containerImage: containerImage,
    handleClose,
}: {
    containerImage: IContainerImage;
    handleClose: () => void;
}) {
    const keycloak = useKeycloak();
    const tasks = useApplicationTasks();

    const [deploymentConfig, setDeploymentConfig] = useState<IContainerDeploymentCreate>({
        name: '',
        edge_device_id: '',
        container_image_id: containerImage.id,
        port_bindings: [],
        runtime: 0,
    });

    const [edgeDevices, setEdgeDevices] = useState<Array<IEdgeDevice>>([]);
    const [deployInProgress, setDeployInProgresss] = useState(false);

    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
    const [deploySuccess, setDeploySuccess] = useState<boolean | undefined>(undefined);

    const [isOmitPortbindingsDialogOpen, setIsOmitPortbindingsDialogOpen] = useState<boolean>(false);

    const handleDeployButtonClick = () => {
        if (!validateDeploymentConfig(false)) return;
        if (deploymentConfig.port_bindings.length == 1) {
            const port_binding = deploymentConfig.port_bindings[0];
            if (port_binding.container_port == '' && port_binding.host_port == '') {
                setIsOmitPortbindingsDialogOpen(true);
                return;
            }
        }
        executeDeployment();
    };

    const executeDeployment = async (omitPortbindings = false) => {
        if (deploySuccessful()) {
            handleClose();
            return;
        }

        console.log('Deployment config:', deploymentConfig);
        console.log('Omit port bindings: ', omitPortbindings);

        if (!validateDeploymentConfig(!omitPortbindings)) return;

        deploymentConfig.name = deploymentConfig.name.trim().replaceAll(' ', '-');

        setErrorMsg(undefined);
        setDeploySuccess(false);

        setDeployInProgresss(true);

        const payload = deploymentConfig;
        if (omitPortbindings) {
            payload.port_bindings = [];
        }

        httpPost(keycloak, CONTAINER_DEPLOYMENTS_PATH, payload)
            .then((deployment) => {
                console.log('Container deployment creation response:', deployment);

                httpPut(keycloak, `${CONTAINER_DEPLOYMENTS_PATH}/${deployment.id}/deploy`, {}, undefined, true)
                    .then(({ headers }) => {
                        httpGet(keycloak, headers.get('Location'))
                            .then((task) => tasks?.addServerBackgroundTask(keycloak, tasks, task))
                            .catch(console.error);
                        setErrorMsg(undefined);
                        setDeploySuccess(true);
                    })
                    .catch((error) => {
                        if (error.body) {
                            setErrorMsg(error.body.detail);
                        } else {
                            setErrorMsg(error.message);
                        }
                        setDeploySuccess(false);
                        console.error('Container deployment error:', error);
                    })
                    .finally(() => {
                        setDeployInProgresss(false);
                    });
            })
            .catch((error) => {
                if (error.body) {
                    setErrorMsg(error.body.detail);
                } else {
                    setErrorMsg(error.message);
                }

                setDeploySuccess(false);
                setDeployInProgresss(false);
                console.error('Container creation error:', error);
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

    const addPortBinding = (container_port: string, host_port: string, protocol: string) => {
        const portBindings = deploymentConfig.port_bindings;
        portBindings.push({ container_port, host_port, protocol });
        setDeploymentConfig({ ...deploymentConfig, port_bindings: portBindings });
    };

    const addEmptyPortBinding = () => {
        addPortBinding('', '', 'tcp');
    };

    const updatePortBinding = (index: number, key: IPortBindingKeys, value: string) => {
        const portBindings = deploymentConfig.port_bindings;
        portBindings[index][key] = value;
        setDeploymentConfig({ ...deploymentConfig, port_bindings: portBindings });
        console.log(deploymentConfig);
    };

    const removePortBinding = (index: number) => {
        const portBindings = deploymentConfig.port_bindings;
        portBindings.splice(index, 1);
        setDeploymentConfig({ ...deploymentConfig, port_bindings: portBindings });
    };

    useEffect(() => {
        fetchEdgeDevices();

        // init the port bindings with the ports
        // exported by the image by default
        if (containerImage && containerImage.exposed_ports) {
            if (deploymentConfig.port_bindings.length < containerImage.exposed_ports.length) {
                console.log(containerImage.exposed_ports);
                containerImage.exposed_ports.forEach((port) => {
                    const [from, protocol] = port.split('/');
                    addPortBinding(from, from, protocol);
                    console.log(from, protocol);
                });
            }
        }
        if (!deploymentConfig.port_bindings.length) addEmptyPortBinding();
    }, [keycloak, containerImage]);

    const isDeploying = () => {
        return deployInProgress;
    };

    const deploySuccessful = () => {
        return deploySuccess;
    };

    const getButtonText = () => {
        if (isDeploying()) return 'Deploying';
        if (deploySuccessful()) return 'Close';
        return 'Deploy';
    };

    const onClose = () => {
        if (isDeploying()) {
            return;
        }
        handleClose();
    };

    const validateDeploymentConfig = (checkPortBindings = true) => {
        if (!deploymentConfig.edge_device_id) {
            setErrorMsg('Please specify an edge device.');
            return;
        }
        if (!deploymentConfig.name.trim()) {
            setErrorMsg('Please specify a name.');
            return;
        }
        if (checkPortBindings) {
            for (const portBinding of deploymentConfig.port_bindings) {
                if (!portBinding.container_port) {
                    setErrorMsg('Please specify a source port.');
                    return;
                }
                if (!portBinding.host_port) {
                    setErrorMsg('Please specify a target port.');
                    return;
                }
                if (!portBinding.protocol) {
                    setErrorMsg('Please specify a protocol.');
                    return;
                }
            }
        }

        return true;
    };

    const getEdgeDeviceMenuItem = (edgeDevice: IEdgeDevice) => {
        // This should be fixed server side, because aarch64 is converted into arm64
        /* const isArchitecturesCompatible = (edgeDevice: IEdgeDevice, container: IContainer) => {
            let compatible = edgeDevice.arch ? container.platform?.includes(edgeDevice.arch) : false;
            if (!compatible && 
                (container.platform?.includes("arm64") && edgeDevice.arch?.includes("aarch64") 
                || container.platform?.includes("aarch64") && edgeDevice.arch?.includes("arm64"))) {
                compatible = true;
            }
            return compatible
        }*/
        const compatible = edgeDevice.arch && containerImage.platform?.includes(edgeDevice.arch);

        let message: string | null = null;
        if (!edgeDevice.registered) {
            message = ' (not registered)';
        } else if (!compatible) {
            message = ` (incompatible: ${edgeDevice.arch} != ${containerImage.platform})`;
        }
        return (
            <MenuItem key={edgeDevice.id} value={edgeDevice.id} disabled={!(edgeDevice.registered && compatible)}>
                {edgeDevice.name}
                {message}
            </MenuItem>
        );
    };

    const getRuntimeMenuItems = () => {
        return (
            <MenuItem key={0} value={0}>
                Default
            </MenuItem>
        );
    };

    return (
        <>
            <Dialog open={true} onClose={onClose} fullWidth maxWidth="xs">
                <DialogTitle>Deploy Container</DialogTitle>
                <DialogContent>
                    {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
                    {deploySuccess ? (
                        <Alert severity="info">Deployment started. Check the Task Drawer for the current status!</Alert>
                    ) : null}
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <TextField
                                id="image-textfield"
                                label="Image"
                                variant="standard"
                                value={`${containerImage.repository}:${containerImage.tag}`}
                                required
                                fullWidth
                                disabled
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {deployInProgress ? <CircularProgress color="primary" sx={{ float: 'right' }} /> : null}
                            {deploySuccess ? <CheckIcon color="primary" sx={{ float: 'right' }} /> : null}
                        </Grid>
                    </Grid>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="edge-devices">Edge Device *</InputLabel>
                                <Select
                                    labelId="edge-devices"
                                    id="edge-devices-select"
                                    value={'' + deploymentConfig.edge_device_id}
                                    label="Edge Device *"
                                    onChange={(event: SelectChangeEvent) => {
                                        setDeploymentConfig({
                                            ...deploymentConfig,
                                            edge_device_id: +event.target.value,
                                        });
                                    }}
                                >
                                    {edgeDevices.map((edgeDevice) => getEdgeDeviceMenuItem(edgeDevice))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <FormControl fullWidth variant="standard" disabled>
                                <InputLabel id="runtimes">Runtime *</InputLabel>
                                <Select
                                    labelId="runtimes"
                                    id="runtimes-select"
                                    value={'' + deploymentConfig.runtime}
                                    label="Runtime *"
                                    onChange={(event: SelectChangeEvent) => {
                                        setDeploymentConfig({
                                            ...deploymentConfig,
                                            runtime: +event.target.value,
                                        });
                                    }}
                                >
                                    {getRuntimeMenuItems()}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container direction="row" mt={2} sx={{ height: '50px' }}>
                        <Grid item xs={10}>
                            <TextField
                                id="name-textfield"
                                label="Name"
                                variant="standard"
                                onChange={(e) => setDeploymentConfig({ ...deploymentConfig, name: e.target.value })}
                                value={deploymentConfig.name}
                                required
                                fullWidth
                                disabled={isDeploying()}
                            />
                        </Grid>
                    </Grid>
                    <h4>Port Bindings</h4>
                    {deploymentConfig.port_bindings.map((portBinding, index) => (
                        <Grid container direction="row" mt={2} key={index}>
                            <Grid item xs={11}>
                                <ContainerDeployPortBinding
                                    index={index}
                                    portBinding={portBinding}
                                    updatePortBinding={updatePortBinding}
                                    isDeploying={isDeploying}
                                />
                            </Grid>
                            {index === 0 && (
                                <Grid item xs={1} mt={3} ml={-1}>
                                    <Fab color="primary" aria-label="add" size="small" onClick={addEmptyPortBinding}>
                                        <AddIcon />
                                    </Fab>
                                </Grid>
                            )}
                            {index > 0 && (
                                <Grid item xs={1} mt={3} ml={-1}>
                                    <Fab
                                        color="secondary"
                                        aria-label="remove"
                                        size="small"
                                        onClick={() => removePortBinding(index)}
                                    >
                                        <RemoveIcon />
                                    </Fab>
                                </Grid>
                            )}
                        </Grid>
                    ))}
                </DialogContent>
                <DialogActions>
                    <LoadingButton onClick={handleDeployButtonClick} loading={isDeploying()}>
                        {getButtonText()}
                    </LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={isOmitPortbindingsDialogOpen}>
                <DialogTitle>Empty port bindings confirmation</DialogTitle>
                <DialogContent>
                    {/* Your confirmation message */}
                    You didn't specify any port bindings for the deployment. Are you sure you want to deploy the
                    container with no port bindings?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOmitPortbindingsDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setIsOmitPortbindingsDialogOpen(false);
                            executeDeployment(true);
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
