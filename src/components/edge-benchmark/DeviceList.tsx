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

import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import IDeviceHeader from '../../types/edge-benchmark/IDeviceHeader';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import BenchmarkDeviceDetailsModal from '../../components/edge-benchmark/BenchmarkDeviceDetailsModal';
import { EDGE_BENCHMARK_DEVICE_PATH } from '../../endpoints';
import useKeycloak from '../../contexts/KeycloakContext';
import { httpGet } from '../../api';

const DeviceList = ({
    deviceHeaders,
    onDeviceSelectionChange,
}: {
    deviceHeaders: IDeviceHeader[];
    onDeviceSelectionChange: (selectedDeviceHeaders: IDeviceHeader[]) => void;
}) => {
    const keycloak = useKeycloak();

    const [selectedDeviceHeader, setSelectedDeviceHeader] = useState<IDeviceHeader>();
    const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<Record<string, any>>();
    const [deviceInfoModalOpen, setDeviceInfoModalOpen] = useState(false);
    const [deviceInfoLoadingStates, setDeviceInfoLoadingStates] = useState<Record<string, boolean>>({});

    const columns = [
        { field: 'name', headerName: 'Device name', flex: 1 },
        { field: 'hostname', headerName: 'Hostname', flex: 1 },
        { field: 'ip', headerName: 'Device IP', flex: 1 },
        {
            field: 'timestamp',
            headerName: 'Last seen',
            flex: 1,
            renderCell: (params: any) => {
                const date = new Date(params.value);

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
        },
        {
            field: 'online',
            headerName: 'Online status',
            flex: 1,
            renderCell: (params: any) => {
                if (params.value) return <CheckCircleIcon color="primary" />;
                return <CancelIcon style={{ color: 'red' }} />;
            },
        },
        {
            field: 'device_info',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params: any) => {
                const deviceHeader = params.row;
                const hostname = deviceHeader.hostname;
                return (
                    <Tooltip title="Show device information">
                        <span>
                            <LoadingButton
                                color="info"
                                variant="contained"
                                loading={deviceInfoLoadingStates[hostname]}
                                loadingPosition="end"
                                endIcon={<InfoIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShowDeviceInfoClick(deviceHeader);
                                }}
                            >
                                Info
                            </LoadingButton>
                        </span>
                    </Tooltip>
                );
            },
        },
    ];

    const onDeviceInfoModalClose = () => {
        setDeviceInfoModalOpen(false);
    };

    const onShowDeviceInfoClick = (deviceHeader: IDeviceHeader) => {
        setSelectedDeviceHeader(deviceHeader);
        const hostname = deviceHeader.hostname;
        setDeviceInfoLoadingStates({ ...deviceInfoLoadingStates, [hostname]: true });
        httpGet(keycloak, `${EDGE_BENCHMARK_DEVICE_PATH}/${hostname}/info`)
            .then((deviceInfo) => {
                setSelectedDeviceInfo(deviceInfo);
                setDeviceInfoLoadingStates({ ...deviceInfoLoadingStates, [hostname]: false });
                setDeviceInfoModalOpen(true);
            })
            .catch((error) => console.error('Error fetching device info:', error));
    };

    return (
        <>
            <DataGrid
                rows={deviceHeaders}
                columns={columns}
                getRowId={(deviceHeader: IDeviceHeader) => deviceHeader.ip}
                checkboxSelection
                onRowSelectionModelChange={(ips: GridRowSelectionModel) => {
                    const selectedDeviceHeaders = deviceHeaders.filter((deviceHeader) => ips.includes(deviceHeader.ip));
                    onDeviceSelectionChange(selectedDeviceHeaders);
                }}
            />
            {deviceInfoModalOpen && selectedDeviceHeader && selectedDeviceInfo ? (
                <BenchmarkDeviceDetailsModal
                    onClose={onDeviceInfoModalClose}
                    deviceHeader={selectedDeviceHeader}
                    deviceInfo={selectedDeviceInfo}
                />
            ) : null}
        </>
    );
};

export default DeviceList;
