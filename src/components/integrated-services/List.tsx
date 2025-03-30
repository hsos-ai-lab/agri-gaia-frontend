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

import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IIntegratedService from '../../types/IIntegratedService';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import ServiceDeleteButton from './ServiceDeleteButton';
import DisplaySettingsOutlinedIcon from '@mui/icons-material/DisplaySettingsOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import useKeycloak from '../../contexts/KeycloakContext';
import DatasetIcon from '@mui/icons-material/Dataset';
import ServiceBrowseButton from './ServiceBrowseButton';
import { Button } from '@mui/material';
import DataUsageOutlinedIcon from '@mui/icons-material/DataUsageOutlined';

interface IIntergratedServiceListProps {
    integratedServices: IIntegratedService[];
    createServiceInput: (service_name: string) => void;
    getServiceSpec: (service_name: string) => void;
    onTogglePublic: (service_id: number) => void;
    onDelete: () => void;
    setExportDialogOpen: () => void;
}

export default function IntegratedServiceList({
    integratedServices,
    onTogglePublic,
    createServiceInput,
    getServiceSpec,
    onDelete,
    setExportDialogOpen,
}: IIntergratedServiceListProps) {
    const keycloak = useKeycloak();

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Public</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integratedServices.map((service) => (
                            <TableRow
                                key={String(service.name)}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>
                                    <Button onClick={() => createServiceInput(service.name)}>{service.name}</Button>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Publish">
                                        <Switch
                                            checked={service.public}
                                            onChange={() => onTogglePublic(service.id)}
                                        ></Switch>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="right">
                                    <Grid container spacing={1} justifyContent="flex-end">
                                        <Grid item>
                                            <Tooltip title="Use">
                                                <LoadingButton onClick={() => getServiceSpec(service.name)}>
                                                    <DataUsageOutlinedIcon />
                                                </LoadingButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title="Use">
                                                <LoadingButton onClick={() => createServiceInput(service.name)}>
                                                    <DisplaySettingsOutlinedIcon />
                                                </LoadingButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title="View">
                                                <ServiceBrowseButton service={service} />
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title="Export">
                                                <LoadingButton onClick={() => setExportDialogOpen()}>
                                                    <DatasetIcon />
                                                </LoadingButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title="Delete">
                                                <ServiceDeleteButton
                                                    serviceId={service.id}
                                                    serviceName={service.name}
                                                    onDelete={onDelete}
                                                />
                                            </Tooltip>
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
