// SPDX-FileCopyrightText: 2024 University of Applied Sciences Osnabrück
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Henri Graf
// SPDX-FileContributor: Jonas Tüpker
// SPDX-FileContributor: Lukas Hesse
// SPDX-FileContributor: Maik Fruhner
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
// SPDX-FileContributor: Tobias Wamhof
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import IEdgeDevice from '../../types/IEdgeDevice';
import EdgeDeviceDeleteButton from './EdgeDeviceDeleteButton';

import { useNavigate } from 'react-router-dom';

import { getStatus, getHeartbeatTime } from './edge-utils';

interface IEdgeDeviceListProps {
    edgeDevices: IEdgeDevice[];
    refreshCallback: () => void;
}

const buildStatusCell = (device: IEdgeDevice) => {
    const status = getStatus(device);
    let lampColor;
    switch (status) {
        case 'Online':
            lampColor = '#8ebe22';
            break;
        case 'Offline':
            lampColor = 'red';
            break;
        default:
            lampColor = 'orange';
            break;
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
                style={{
                    backgroundColor: lampColor,
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '5px',
                }}
            ></span>
            <span>{status}</span>
        </div>
    );
};

export default function EdgeDeviceList({ edgeDevices, refreshCallback }: IEdgeDeviceListProps) {
    const navigate = useNavigate();

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Seen</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {edgeDevices.map((device) => (
                            <TableRow key={device.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>{device.name}</TableCell>
                                <TableCell>{buildStatusCell(device)}</TableCell>
                                <TableCell>{getHeartbeatTime(device.last_heartbeat)}</TableCell>
                                <TableCell align="right">
                                    <Grid container spacing={4} justifyContent="flex-end" alignItems="center">
                                        <Grid item>
                                            <Button variant="outlined" onClick={() => navigate(`${device.id}`)}>
                                                Details
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <EdgeDeviceDeleteButton
                                                edgeDeviceId={device.id}
                                                edgeDeviceName={device.name}
                                                onDelete={refreshCallback}
                                            />
                                        </Grid>
                                    </Grid>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
