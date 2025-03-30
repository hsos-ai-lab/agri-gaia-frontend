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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import IContainerDeployment from '../../types/IContainerDeployment';
import ContainerDeploymentDeleteButton from './ContainerDeploymentDeleteButton';
import ContainerDeploymentDeployButton from './ContainerDeploymentDeployButton';
import ContainerDeploymentUndeployButton from './ContainerDeploymentUndeployButton';

interface IEdgeDeviceListProps {
    containerDeployments: IContainerDeployment[];
    refreshCallback: () => void;
}

function ContainerDeploymentRow(props: { deployment: IContainerDeployment; refreshCallback: () => void; key: number }) {
    const { deployment, refreshCallback } = props;
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{deployment.name}</TableCell>
                <TableCell>{deployment.status}</TableCell>
                <TableCell>{`${deployment.container_image.repository}:${deployment.container_image.tag}`}</TableCell>
                <TableCell align="right">
                    <Grid container spacing={1} justifyContent="flex-end">
                        {deployment.status === 'deployed' ? (
                            <Grid item>
                                <ContainerDeploymentUndeployButton
                                    containerDeploymentId={deployment.id}
                                    containerDeploymentName={deployment.name}
                                    onUndeploy={refreshCallback}
                                />
                            </Grid>
                        ) : (
                            <>
                                <Grid item>
                                    <ContainerDeploymentDeployButton
                                        containerDeploymentId={deployment.id}
                                        containerDeploymentName={deployment.name}
                                        onDeploy={refreshCallback}
                                    />
                                </Grid>
                                <Grid item>
                                    <ContainerDeploymentDeleteButton
                                        containerDeploymentId={deployment.id}
                                        containerDeploymentName={deployment.name}
                                        onDelete={refreshCallback}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Grid container spacing={2} justifyContent="space-between">
                                <Grid item xs={2}>
                                    <b>Creation Date: </b>
                                </Grid>
                                <Grid item xs={10}>
                                    {new Date(deployment.creation_date).toLocaleString()}
                                </Grid>
                                <Grid item xs={12}>
                                    <b>Port Bindings:</b>
                                </Grid>
                                <Grid item xs={12}>
                                    <Table size="small" aria-label="port bindings">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Container Port</TableCell>
                                                <TableCell>Host Port</TableCell>
                                                <TableCell>Protocol</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deployment.port_bindings.map((pm) => (
                                                <TableRow
                                                    key={pm.container_port}
                                                    sx={{ '& > *': { borderBottom: 'unset' } }}
                                                >
                                                    <TableCell>{pm.container_port}</TableCell>
                                                    <TableCell>{pm.host_port}</TableCell>
                                                    <TableCell>{pm.protocol}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function ContainerDeploymentList({ containerDeployments, refreshCallback }: IEdgeDeviceListProps) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {containerDeployments.map((deployment) => (
                            <ContainerDeploymentRow
                                key={deployment.id}
                                deployment={deployment}
                                refreshCallback={refreshCallback}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
