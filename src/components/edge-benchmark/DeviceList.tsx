// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: MIT

import * as React from 'react';
import DeviceCard from './DeviceCard';
import BenchmarkDevice from '../../types/IBenchmarkDevice';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import IBenchmarkDevice from '../../types/IBenchmarkDevice';
import { LegendToggleRounded } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const DeviceList = ({
    devices,
    onDeviceClick,
    addToCart,
    cartItems,
    setCartItems,
}: {
    devices: Array<BenchmarkDevice>;
    onDeviceClick: (device: BenchmarkDevice) => void;
    addToCart: (device: BenchmarkDevice) => void;
    cartItems: BenchmarkDevice[];
    setCartItems: (cartItems: BenchmarkDevice[]) => void;
}) => {
    const [selectedDevice, setSelectedDevice] = useState<IBenchmarkDevice>();
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedRows, setSelectedRows] = React.useState<IBenchmarkDevice[]>([]);

    const columns = [
        { field: 'name', headerName: 'Device Name', width: 500 },
        { field: 'hostname', headerName: 'Hostname', width: 200 },
        { field: 'ip', headerName: 'Device IP', width: 200 },
        { field: 'heartbeat_interval', headerName: 'Heartbeat Interval', width: 200 },
        { field: 'timestamp', headerName: 'Timestamp', width: 250 },
        {
            field: 'online',
            headerName: 'Online-Status',
            width: 100,
            renderCell: (params: any) => {
                if (params.value) {
                    return <CheckCircleIcon color="primary" />;
                } else {
                    return <CancelIcon style={{ color: 'red' }} />;
                }
            },
        },
    ];

    const handleRowClick = (params: any) => {
        console.log(params);
        if (params.field != '__check__') {
            const device = devices.find((device) => device.ip === params.id);
            if (device != null) {
                setDetailsDialogOpen(true);
                onDeviceClick(device);
            }
        } else {
            console.log('--');
        }
    };

    return (
        <div style={{ height: '500', width: '100%' }}>
            <DataGrid
                rows={devices}
                columns={columns}
                getRowId={(row: any) => row.ip}
                onCellClick={handleRowClick}
                checkboxSelection
                onRowSelectionModelChange={(ids: any) => {
                    console.log(ids);
                    const selectedIDs = new Set(ids);
                    const selectedRows = devices.filter((row) => selectedIDs.has(row.ip));
                    setCartItems(selectedRows);
                }}
            />
        </div>
    );
};

export default DeviceList;
