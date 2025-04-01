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

import { DataGrid } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';

const DeviceList = ({
    deviceHeaders,
    onDeviceClick,
    onDeviceSelectionChange,
}: {
    deviceHeaders: IDeviceHeader[];
    onDeviceClick: (deviceHeader: IDeviceHeader) => void;
    onDeviceSelectionChange: (selectedDeviceHeaders: IDeviceHeader[]) => void;
}) => {
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
                if (params.value) return <CheckCircleIcon color="primary" />;
                return <CancelIcon style={{ color: 'red' }} />;
            },
        },
    ];

    const onCellClick = (params: any) => {
        if (params.field == '__check__') return;

        const deviceHeader = deviceHeaders.find((deviceHeader) => deviceHeader.ip === params.id);
        if (deviceHeader != null) onDeviceClick(deviceHeader);
    };

    return (
        <DataGrid
            rows={deviceHeaders}
            columns={columns}
            getRowId={(deviceHeader: IDeviceHeader) => deviceHeader.ip}
            onCellClick={onCellClick}
            checkboxSelection
            onRowSelectionModelChange={(ips: GridRowSelectionModel) => {
                const selectedDeviceHeaders = deviceHeaders.filter((deviceHeader) => ips.includes(deviceHeader.ip));
                onDeviceSelectionChange(selectedDeviceHeaders);
            }}
        />
    );
};

export default DeviceList;
