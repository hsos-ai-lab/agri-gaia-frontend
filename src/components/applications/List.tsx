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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';

import IApplication from '../../types/IApplication';
import ApplicationDeleteButton from './ApplicationDeleteButton';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Alert } from '@mui/material';
import { Fragment } from 'react';

interface IApplicationListProps {
    applications: IApplication[];
    onDelete: () => void;
    onUpdateClick: (app: IApplication) => void;
}
// Portainer 2.18+ edge stack status: read the latest stage from Status[],
// not the deprecated top-level Type (which never updates past Pending).
// Enum: 0 Pending, 1 DeploymentReceived, 2 Error, 3 Acknowledged,
//       4 Remove, 5 RemoteUpdateSuccess, 6 ImagesPulled,
//       7 Running, 8 Deploying, 9 Removing.
const RUNNING = 7;
const ERROR = 2;

const currentType = (endpointStatus: any): number => {
    const stages = endpointStatus?.Status;
    if (Array.isArray(stages) && stages.length > 0) {
        return stages[stages.length - 1].Type;
    }
    return endpointStatus?.Type ?? 0;
};

const currentError = (endpointStatus: any): string => {
    const stages = endpointStatus?.Status;
    if (Array.isArray(stages)) {
        for (let i = stages.length - 1; i >= 0; i--) {
            if (stages[i].Type === ERROR && stages[i].Error) return stages[i].Error;
        }
    }
    return endpointStatus?.Error ?? '';
};

const StatusIcon = ({ type }: { type: number }) => {
    let backgroundColor = '#337ab7'; // neutral / pending
    if (type === RUNNING) backgroundColor = '#23ae89';
    else if (type === ERROR) backgroundColor = '#ae2323';
    return <div style={{ backgroundColor, width: '10px', height: '10px', borderRadius: '50%', marginRight: '3px' }} />;
};

const StatusNumber = ({ type, app }: { type: number; app: IApplication }) => {
    let count = 0;
    if (app.status) {
        for (const key in app.status) {
            if (currentType(app.status[key]) === type) count++;
        }
    }
    return <span style={{ marginRight: '5px' }}>{count}</span>;
};

const StatusComponent = ({ app }: { app: IApplication }) => {
    const types = [RUNNING, ERROR];
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {types.map((type) => (
                <Fragment key={type}>
                    <StatusIcon type={type} />
                    <StatusNumber type={type} app={app} />
                </Fragment>
            ))}
        </div>
    );
};

const MessageComponent = ({ app }: { app: IApplication }) => {
    if (!app.status) return <span />;

    let errMsg: string | null = null;
    let hasSuccess = false;

    for (const key in app.status) {
        const t = currentType(app.status[key]);
        if (t === RUNNING) hasSuccess = true;
        else if (t === ERROR) errMsg = currentError(app.status[key]) || 'Unknown error';
    }

    if (errMsg) return <Alert sx={{ maxHeight: '100px' }} severity="error">{errMsg}</Alert>;
    if (hasSuccess) return <Alert severity="success">Looking great!</Alert>;
    return <Alert severity="info">Waiting for Devices...</Alert>;
};

export default function ({ applications, onDelete, onUpdateClick }: IApplicationListProps) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ minWidth: '200px' }}>Name</TableCell>
                        <TableCell sx={{ minWidth: '200px' }}>Status</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell sx={{ minWidth: '150px' }} align="right">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {applications.map((app) => (
                        <TableRow key={app.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell component="th" scope="row">
                                {app.name}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                <StatusComponent app={app} />
                            </TableCell>
                            <TableCell component="th" scope="row">
                                <MessageComponent app={app} />
                            </TableCell>
                            <TableCell align="right">
                                <Grid container spacing={1} justifyContent="flex-end">
                                    <Grid item>
                                        <Tooltip title="Edit">
                                            <IconButton aria-label="edit" onClick={() => onUpdateClick(app)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item>
                                        <ApplicationDeleteButton application={app} onDelete={onDelete} />
                                    </Grid>
                                </Grid>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
