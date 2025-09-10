// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import IAlertMessage from '../types/IAlertMessage';
import ISensorInfo from '../types/edge-benchmark/ISensorInfo';
import { Grid, Typography } from '@mui/material';
import AlertSnackbar from '../components/common/AlertSnackbar';
import useKeycloak from '../contexts/KeycloakContext';
import CaptureIcon from '@mui/icons-material/Camera';
import AddIcon from '@mui/icons-material/Add';
import { EDGE_BENCHMARK_SENSOR_PATH } from '../endpoints';
import SensorList from '../components/edge-benchmark/SensorList';
import SensorDialog from '../components/edge-benchmark/SensorDialog';
import SensorConfigDialog from '../components/edge-benchmark/SensorConfigDialog';
import { httpGet } from '../api';

const EdgeBenchmarkSensors = () => {
    const keycloak = useKeycloak();

    const [sensorInfos, setSensorInfos] = useState<ISensorInfo[]>([]);
    const [sensorInfoToEdit, setSensorInfoToEdit] = useState<ISensorInfo | undefined>(undefined);
    const [sensorInfoToEditHostname, setSensorInfoToEditHostname] = useState<string | undefined>(undefined);
    const [selectedSensorInfo, setSelectedSensorInfo] = useState<ISensorInfo | undefined>(undefined);
    const [sensorConfigModalOpen, setSensorConfigModalOpen] = useState(false);
    const [sensorModalOpen, setSensorModalOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    useEffect(() => {
        fetchSensorInfos();
    }, [keycloak]);

    const fetchSensorInfos = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_SENSOR_PATH)
            .then((_sensorInfos) => setSensorInfos(_sensorInfos))
            .catch((error) => console.error(error));
    };

    const onSensorSelectionChange = (selectedSensorInfos: ISensorInfo[]) => {
        if (selectedSensorInfos.length) setSelectedSensorInfo(selectedSensorInfos[0]);
        else setSelectedSensorInfo(undefined);
    };

    const onSensorConfigDialogClose = () => {
        setSensorConfigModalOpen(false);
    };

    const onDatasetCaptureSuccess = () => {
        if (selectedSensorInfo)
            setSnackbarMessage({
                message: `Dataset was successfully captured using sensor '${selectedSensorInfo.hostname}'.`,
                severity: 'success',
                open: true,
            });
    };

    const onSensorConfigDialogSubmit = () => {
        if (selectedSensorInfo)
            setSnackbarMessage({
                message: `Dataset capture using sensor '${selectedSensorInfo.hostname}' is in progress...`,
                severity: 'info',
                open: true,
            });
    };

    const onSensorConfigIconClick = () => {
        if (selectedSensorInfo) setSensorConfigModalOpen(true);
    };

    const onSensorAddIconClick = () => {
        if (sensorInfos) setSensorModalOpen(true);
    };

    const onSensorAddDialogClose = () => {
        setSensorInfoToEdit(undefined);
        setSensorModalOpen(false);
    };

    const onSensorAddSuccess = (hostname: string) => {
        fetchSensorInfos();
        setSnackbarMessage({
            message: `New sensor '${hostname}' was successfully added!`,
            severity: 'success',
            open: true,
        });
    };

    const onSensorEditSuccess = (hostname: string) => {
        fetchSensorInfos();
        setSnackbarMessage({
            message: `Sensor '${hostname}' was successfully updated!`,
            severity: 'success',
            open: true,
        });
    };

    const onSensorEditClick = (sensorInfo: ISensorInfo) => {
        setSensorInfoToEditHostname(sensorInfo.hostname);
        setSensorInfoToEdit(sensorInfo);
        setSensorModalOpen(true);
    };

    const onSensorDeleteClick = (hostname: string) => {
        fetchSensorInfos();
        setSnackbarMessage({
            message: `Sensor '${hostname}' was successfully deleted!`,
            severity: 'success',
            open: true,
        });
    };

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={10}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark Sensors
                    </Typography>
                </Grid>
                <Grid item xs={2}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        size="small"
                        sx={{ float: 'right' }}
                        onClick={onSensorAddIconClick}
                    >
                        <AddIcon />
                    </Fab>
                    {selectedSensorInfo ? (
                        <Fab
                            color="primary"
                            aria-label="configure"
                            size="small"
                            sx={{ float: 'right', mr: 1 }}
                            onClick={onSensorConfigIconClick}
                        >
                            <CaptureIcon />
                        </Fab>
                    ) : null}
                </Grid>
                <Grid item xs={12}>
                    <Typography>Capture benchmark datasets by selecting a sensor from the list below.</Typography>
                </Grid>
            </Grid>
            <SensorList
                onEdit={onSensorEditClick}
                onDelete={onSensorDeleteClick}
                onSensorSelectionChange={onSensorSelectionChange}
                sensorInfos={sensorInfos}
            />
            {sensorModalOpen && sensorInfos ? (
                <SensorDialog
                    onAdd={onSensorAddSuccess}
                    onEdit={onSensorEditSuccess}
                    onClose={onSensorAddDialogClose}
                    sensorInfoToEditHostname={sensorInfoToEditHostname}
                    sensorInfoToEdit={sensorInfoToEdit}
                    sensorInfos={sensorInfos}
                />
            ) : null}
            {sensorConfigModalOpen && selectedSensorInfo ? (
                <SensorConfigDialog
                    onClose={onSensorConfigDialogClose}
                    onSubmit={onSensorConfigDialogSubmit}
                    onSuccess={onDatasetCaptureSuccess}
                    selectedSensorInfo={selectedSensorInfo}
                />
            ) : null}
            <AlertSnackbar
                message={snackbarMessage.message}
                severity={snackbarMessage.severity}
                open={snackbarMessage.open}
                onClose={() => setSnackbarMessage({ ...snackbarMessage, open: false })}
            />
        </>
    );
};

export default EdgeBenchmarkSensors;
