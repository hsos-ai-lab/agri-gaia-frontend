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

import { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import IAlertMessage from '../types/IAlertMessage';
import ISensorInfo from '../types/edge-benchmark/ISensorInfo';
import { Grid, Typography } from '@mui/material';
import AlertSnackbar from '../components/common/AlertSnackbar';
import useKeycloak from '../contexts/KeycloakContext';
import SettingsIcon from '@mui/icons-material/Settings';
import { EDGE_BENCHMARK_SENSOR_PATH } from '../endpoints';
import SensorList from '../components/edge-benchmark/SensorList';
import SensorConfigDialog from '../components/edge-benchmark/SensorConfigDialog';
import { httpGet } from '../api';

const EdgeBenchmarkSensors = () => {
    const keycloak = useKeycloak();

    const [sensorInfos, setSensorInfos] = useState<ISensorInfo[]>([]);
    const [selectedSensorInfo, setSelectedSensorInfo] = useState<ISensorInfo | undefined>(undefined);
    const [sensorConfigModalOpen, setSensorConfigModalOpen] = useState(false);
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

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark Sensors
                    </Typography>
                </Grid>
                {selectedSensorInfo ? (
                    <Grid item xs={6}>
                        <Fab
                            color="primary"
                            aria-label="add"
                            size="small"
                            sx={{ float: 'right', mr: 2 }}
                            onClick={onSensorConfigIconClick}
                        >
                            <SettingsIcon />
                        </Fab>
                    </Grid>
                ) : null}
                <Grid item xs={12}>
                    <Typography>Capture benchmark datasets by selecting a sensor from the list below.</Typography>
                </Grid>
            </Grid>
            <SensorList sensorInfos={sensorInfos} onSensorSelectionChange={onSensorSelectionChange} />
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
