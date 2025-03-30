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

import React, { useEffect, useState } from 'react';
import DeviceList from '../components/edge-benchmark/DeviceList';
import DeviceFilter from '../components/edge-benchmark/DeviceFilter';
import DeviceDetails from '../components/edge-benchmark/DeviceDetails';
import BenchmarkDevice from '../types/IBenchmarkDevice';
import useKeycloak from '../contexts/KeycloakContext';
import { httpGet } from '../api';
import { EDGE_BENCHMARK_PATH } from '../endpoints';
import IBenchmarkDevice from '../types/IBenchmarkDevice';
import { AppBar, Backdrop, Grid, Toolbar, Typography } from '@mui/material';
import CartButton from '../components/edge-benchmark/CartButton';
import FullScreenCart from '../components/edge-benchmark/CartFullScreen';
import CartDrawer from '../components/edge-benchmark/CartDrawer';

const App = () => {
    const keycloak = useKeycloak();
    const [devices, setDevices] = useState<BenchmarkDevice[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<BenchmarkDevice>();
    const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<JSON>({} as JSON);
    const [cartItems, setCartItems] = useState<BenchmarkDevice[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fullScreenCartOpen, setFullScreenCartOpen] = useState(false);

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

    return (
        <div className="app">
            <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={6}>
                    <Typography variant="h4" component="h4" style={{ marginBottom: '0.8rem' }}>
                        Edge Device Benchmarking
                    </Typography>
                </Grid>
            </Grid>
            <Grid item md={12} lg={6}>
                <Grid container spacing={1}>
                    <Grid item justifyContent={'left'} xs={11}></Grid>
                    <Grid item justifyContent={'right'}>
                        <CartButton itemCount={cartItems.length} onClick={handleCartClick} />
                    </Grid>
                </Grid>
            </Grid>

            {selectedDevice ? (
                <DeviceDetails
                    device={selectedDevice}
                    deviceInfo={selectedDeviceInfo}
                    cartItems={cartItems}
                    onClose={handleCloseDetails}
                    addToCart={handleAddToCart}
                />
            ) : null}
            <DeviceList
                devices={devices}
                onDeviceClick={handleDeviceClick}
                addToCart={handleAddToCart}
                cartItems={cartItems}
                setCartItems={setCartItems}
            />
            <CartDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                cartItems={cartItems}
                onViewCartClick={handleViewFullCart}
            />
            <Backdrop open={drawerOpen} onClick={handleCloseDrawer} />
            <FullScreenCart open={fullScreenCartOpen} onClose={handleCloseFullScreenCart} cartItems={cartItems} />
        </div>
    );
};

export default App;
