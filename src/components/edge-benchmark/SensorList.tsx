// SPDX-FileCopyrightText: 2025 Osnabrück University of Applied Sciences
// SPDX-FileContributor: Andreas Schliebitz
// SPDX-FileContributor: Prof. Dr.-Ing. Heiko Tapken
//
// SPDX-License-Identifier: MIT

import { useState } from 'react';
import useKeycloak from '../../contexts/KeycloakContext';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ISensorInfo from '../../types/edge-benchmark/ISensorInfo';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { EDGE_BENCHMARK_SENSOR_PATH } from '../../endpoints';
import { httpDelete } from '../../api';

const SensorList = ({
    sensorInfos,
    onDelete,
    onSensorSelectionChange,
}: {
    sensorInfos: ISensorInfo[];
    onDelete: (hostname: string) => void;
    onSensorSelectionChange: (selectedSensorInfos: ISensorInfo[]) => void;
}) => {
    const keycloak = useKeycloak();
    const [sensorDeleteStates, setSensorDeleteStates] = useState<Record<string, boolean>>({});

    const onSensorEditClick = (hostname: string) => {
        // TODO: Implement
        console.log('Edit:', hostname);
    };

    const onSensorDeleteClick = async (hostname: string) => {
        setSensorDeleteStates({ ...sensorDeleteStates, [hostname]: true });
        httpDelete(keycloak, `${EDGE_BENCHMARK_SENSOR_PATH}/${hostname}`)
            .then(() => onDelete(hostname))
            .catch((error) => console.error(error))
            .finally(() => setSensorDeleteStates({ ...sensorDeleteStates, [hostname]: false }));
    };

    const columns = [
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'manufacturer', headerName: 'Manufacturer', flex: 1 },
        { field: 'model', headerName: 'Model', flex: 1 },
        { field: 'serial', headerName: 'Serial number', width: 200 },
        { field: 'hostname', headerName: 'Hostname', flex: 1 },
        { field: 'ip', headerName: 'Sensor IP', flex: 1 },
        {
            field: 'rtt',
            headerName: 'Latency',
            flex: 1,
            valueGetter: (value: any, row: any) => {
                const rtt_s = row?.status.rtt;
                if (!rtt_s) return 'N/A';
                return `${(rtt_s * 1000).toFixed(3)} ms`;
            },
            renderCell: (params: any) => params.value,
        },
        {
            field: 'last_seen',
            headerName: 'Last seen',
            width: 250,
            valueGetter: (value: any, row: any) => {
                const last_seen = row?.status.last_seen;
                if (!last_seen) return 'never';
                const date = new Date(last_seen);

                return date.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                });
            },
            renderCell: (params: any) => params.value,
        },
        {
            field: 'online',
            headerName: 'Online',
            width: 100,
            valueGetter: (value: any, row: any) => row?.status.online,
            renderCell: (params: any) => {
                return (
                    <Button disabled variant="text">
                        {params.value ? <CheckCircleIcon color="primary" /> : <CancelIcon color="error" />}
                    </Button>
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            valueGetter: (value: any, row: any) => {
                return row.hostname;
            },
            renderCell: (params: any) => {
                return (
                    <>
                        <Tooltip title="Edit sensor">
                            <span>
                                <LoadingButton
                                    color="primary"
                                    loading={false}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSensorEditClick(params.value);
                                    }}
                                >
                                    <EditIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Delete sensor">
                            <span>
                                <LoadingButton
                                    color="error"
                                    loading={sensorDeleteStates[params.value]}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSensorDeleteClick(params.value);
                                    }}
                                >
                                    <DeleteIcon />
                                </LoadingButton>
                            </span>
                        </Tooltip>
                    </>
                );
            },
        },
    ];

    return (
        <DataGrid
            rows={sensorInfos}
            columns={columns}
            getRowId={(sensorInfo: ISensorInfo) => sensorInfo.hostname}
            checkboxSelection
            disableMultipleRowSelection
            onRowSelectionModelChange={(hostnames: GridRowSelectionModel) =>
                onSensorSelectionChange(sensorInfos.filter((sensorInfo) => hostnames.includes(sensorInfo.hostname)))
            }
        />
    );
};

export default SensorList;
