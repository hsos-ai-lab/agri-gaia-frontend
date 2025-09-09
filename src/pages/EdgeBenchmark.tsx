// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import { Grid, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import useKeycloak from '../contexts/KeycloakContext';
import DeviceList from '../components/edge-benchmark/DeviceList';
import IDeviceHeader from '../types/edge-benchmark/IDeviceHeader';
import { EDGE_BENCHMARK_DEVICE_HEADER_PATH } from '../endpoints';
import BenchmarkJobCreateDialog from '../components/edge-benchmark/BenchmarkJobCreateDialog';
import { httpGet } from '../api';
import IAlertMessage from '../types/IAlertMessage';
import AlertSnackbar from '../components/common/AlertSnackbar';

const EdgeBenchmark = () => {
    const keycloak = useKeycloak();

    const [deviceHeaders, setDeviceHeaders] = useState<IDeviceHeader[]>([]);
    const [selectedDeviceHeaders, setSelectedDeviceHeaders] = useState<IDeviceHeader[]>([]);
    const [benchmarkJobConfigModalOpen, setBenchmarkJobConfigModalOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    useEffect(() => {
        fetchDeviceHeaders();
    }, [keycloak]);

    const fetchDeviceHeaders = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_DEVICE_HEADER_PATH)
            .then((deviceHeader) => {
                const deviceHeaders = deviceHeader as IDeviceHeader[];
                deviceHeaders.sort((a, b) => a.hostname.localeCompare(b.hostname));
                setDeviceHeaders(deviceHeaders);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const onDeviceSelectionChange = (selectedDeviceHeaders: IDeviceHeader[]) => {
        setSelectedDeviceHeaders(selectedDeviceHeaders);
    };

    const onBenchmarkJobCreateDialogClose = () => {
        setBenchmarkJobConfigModalOpen(false);
    };

    const onBenchmarkJobCreateSuccess = () => {
        setSnackbarMessage({
            message: `Benchmark job(s) are running. Monitor the Task Drawer for details.`,
            severity: 'info',
            open: true,
        });
    };

    const onBenchmarkJobCreateIconClick = () => {
        if (selectedDeviceHeaders.length) setBenchmarkJobConfigModalOpen(true);
    };

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark
                    </Typography>
                </Grid>
                {selectedDeviceHeaders.length ? (
                    <Grid item xs={6}>
                        <Fab
                            color="primary"
                            aria-label="add"
                            size="small"
                            sx={{ float: 'right', mr: 2 }}
                            onClick={onBenchmarkJobCreateIconClick}
                        >
                            <SettingsIcon />
                        </Fab>
                    </Grid>
                ) : null}
                <Grid item xs={12}>
                    <Typography>Create benchmark jobs by selecting edge devices from the list below.</Typography>
                </Grid>
            </Grid>
            <DeviceList deviceHeaders={deviceHeaders} onDeviceSelectionChange={onDeviceSelectionChange} />
            {benchmarkJobConfigModalOpen && selectedDeviceHeaders.length ? (
                <BenchmarkJobCreateDialog
                    onClose={onBenchmarkJobCreateDialogClose}
                    onSuccess={onBenchmarkJobCreateSuccess}
                    selectedDeviceHeaders={selectedDeviceHeaders}
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

export default EdgeBenchmark;
