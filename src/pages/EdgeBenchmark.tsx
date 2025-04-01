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

import { httpGet } from '../api';
import Fab from '@mui/material/Fab';
import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import IAlertMessage from '../types/IAlertMessage';
import useKeycloak from '../contexts/KeycloakContext';
import SettingsIcon from '@mui/icons-material/Settings';
import DeviceList from '../components/edge-benchmark/DeviceList';
import IDeviceHeader from '../types/edge-benchmark/IDeviceHeader';
import { EDGE_BENCHMARK_DEVICE_PATH, EDGE_BENCHMARK_DEVICE_HEADER_PATH } from '../endpoints';
import BenchmarkJobCreateDialog from '../components/edge-benchmark/BenchmarkJobCreateDialog';

const EdgeBenchmark = () => {
    const keycloak = useKeycloak();
    const [deviceHeaders, setDeviceHeaders] = useState<IDeviceHeader[]>([]);
    const [selectedDeviceHeader, setSelectedDeviceHeader] = useState<IDeviceHeader>();
    const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<Record<string, any>>();
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
                deviceHeaders.sort((a, b) => a.name.localeCompare(b.name));
                setDeviceHeaders(deviceHeaders);
                console.log('Device headers :', deviceHeaders);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const onDeviceClick = (deviceHeader: IDeviceHeader) => {
        setSelectedDeviceHeader(deviceHeader);
        const hostname = deviceHeader.hostname;
        httpGet(keycloak, `${EDGE_BENCHMARK_DEVICE_PATH}/${hostname}/info`)
            .then((deviceInfo) => {
                setSelectedDeviceInfo(deviceInfo);
                console.log(`Info for selected device '${hostname}':`, deviceInfo);
            })
            .catch((error) => console.error(error));
    };

    const onDeviceSelectionChange = (selectedDeviceHeaders: IDeviceHeader[]) => {
        console.log('Select device headers:', selectedDeviceHeaders);
        setSelectedDeviceHeaders(selectedDeviceHeaders);
    };

    const onBenchmarkJobCreate = (benchmarkJobCreateMessage: IAlertMessage) => {
        setSnackbarMessage(benchmarkJobCreateMessage);
    };

    const onBenchmarkJobCreateDialogClose = () => {
        setBenchmarkJobConfigModalOpen(false);
    };

    const onBenchmarkJobCreateIconClick = () => {
        if (selectedDeviceHeaders) setBenchmarkJobConfigModalOpen(true);
    };

    return (
        <>
            <Grid container justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4">
                        Edge Benchmark
                    </Typography>
                </Grid>
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
            </Grid>
            <DeviceList
                deviceHeaders={deviceHeaders}
                onDeviceClick={onDeviceClick}
                onDeviceSelectionChange={onDeviceSelectionChange}
            />
            {benchmarkJobConfigModalOpen && selectedDeviceHeaders ? (
                <BenchmarkJobCreateDialog
                    onCreate={onBenchmarkJobCreate}
                    onClose={onBenchmarkJobCreateDialogClose}
                    selectedDeviceHeaders={selectedDeviceHeaders}
                />
            ) : null}
        </>
    );
};

export default EdgeBenchmark;
