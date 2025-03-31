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
import DeviceList from '../components/edge-benchmark/DeviceList';
import BenchmarkJobCreateDialog from '../components/edge-benchmark/BenchmarkJobCreateDialog';
import BenchmarkDevice from '../types/edge-benchmark/IDeviceHeader';
import useKeycloak from '../contexts/KeycloakContext';
import IBenchmarkDevice from '../types/edge-benchmark/IDeviceHeader';
import { Grid, Typography } from '@mui/material';
import { httpGet } from '../api';
import { EDGE_BENCHMARK_PATH } from '../endpoints';
import Fab from '@mui/material/Fab';
import SettingsIcon from '@mui/icons-material/Settings';
import IAlertMessage from '../types/IAlertMessage';

const EdgeBenchmark = () => {
    const keycloak = useKeycloak();
    const [devices, setDevices] = useState<BenchmarkDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<BenchmarkDevice>();
    const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<JSON>({} as JSON);
    const [cartItems, setCartItems] = useState<BenchmarkDevice[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fullScreenCartOpen, setFullScreenCartOpen] = useState(false);

    const [benchmarkJobConfigModalOpen, setBenchmarkJobConfigModalOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<IAlertMessage>({
        message: undefined,
        severity: undefined,
        open: false,
    });

    useEffect(() => {
        fetchDevices();
    }, [keycloak]);

    const fetchDevices = async () => {
        httpGet(keycloak, EDGE_BENCHMARK_PATH + '/devices')
            .then((json) => {
                const devices = json as IBenchmarkDevice[];
                devices.sort((a, b) => a.name.localeCompare(b.name));
                setDevices(devices);
                console.log('Devices:', devices);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleDeviceClick = (device: BenchmarkDevice) => {
        setSelectedDevice(device);
        httpGet(keycloak, EDGE_BENCHMARK_PATH + '/' + device.hostname + '/info')
            .then((json) => {
                console.log(json);
                setSelectedDeviceInfo(json);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleCloseDetails = () => {
        setSelectedDevice(undefined);
    };

    const handleCartClick = () => {
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
    };

    const handleViewFullCart = () => {
        setFullScreenCartOpen(true);
        setDrawerOpen(false);
    };

    const handleCloseFullScreenCart = () => {
        setFullScreenCartOpen(false);
    };

    const handleAddToCart = (device: BenchmarkDevice) => {
        const itemIndex = cartItems.findIndex((item) => item.ip === device.ip);
        if (itemIndex >= 0) {
            cartItems.splice(itemIndex, 1);
        } else {
            cartItems.push(device);
        }
        setCartItems(cartItems);
        console.log(cartItems);
        handleCloseDetails();
    };

    const handleBenchmarkConfigModalOpen = () => {
        console.log('Benchmark Config Modal Open');
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
                        onClick={() => setBenchmarkJobConfigModalOpen(true)}
                    >
                        <SettingsIcon />
                    </Fab>
                </Grid>
            </Grid>
            <DeviceList
                devices={devices}
                onDeviceClick={handleDeviceClick}
                addToCart={handleAddToCart}
                cartItems={cartItems}
                setCartItems={setCartItems}
            />
            {benchmarkJobConfigModalOpen ? (
                <BenchmarkJobCreateDialog
                    onCreate={(benchmarkJobCreateMessage: IAlertMessage) =>
                        setSnackbarMessage(benchmarkJobCreateMessage)
                    }
                    handleClose={() => setBenchmarkJobConfigModalOpen(false)}
                />
            ) : null}
        </>
    );
};

export default EdgeBenchmark;
