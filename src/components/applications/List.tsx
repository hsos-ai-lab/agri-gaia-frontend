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

interface IApplicationListProps {
    applications: IApplication[];
    onDelete: () => void;
    onUpdateClick: (app: IApplication) => void;
}

const StatusIcon = ({ type }: { type: number }) => {
    let backgroundColor = '#337ab7';
    switch (type) {
        case 1:
            backgroundColor = '#23ae89';
            break;

        case 2:
            backgroundColor = '#ae2323';
            break;
    }
    return <div style={{ backgroundColor, width: '10px', height: '10px', borderRadius: '50%', marginRight: '3px' }} />;
};

const StatusNumber = ({ type, app }: { type: number; app: IApplication }) => {
    let count = 0;
    if (app.status) {
        for (const key in app.status) {
            const status = app.status[key];
            if (status['Type'] != type) {
                continue;
            }
            count++;
        }
    }
    return <span style={{ marginRight: '5px' }}>{count}</span>;
};

const StatusComponent = ({ app }: { app: IApplication }) => {
    const types = [/*0,*/ 1, 2];
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {types.map((type) => (
                <>
                    <StatusIcon type={type} />
                    <StatusNumber type={type} app={app} />
                </>
            ))}
        </div>
    );
};

const MessageComponent = ({ app }: { app: IApplication }) => {
    if (!app.status) {
        return <span></span>;
    }

    let errMsg = null;
    let hasSuccess = false;

    for (const key in app.status) {
        const status = app.status[key];
        if (status['Type'] == 1) {
            hasSuccess = true;
        } else if (status['Type'] == 2) {
            errMsg = status['Error'];
        }
    }

    if (errMsg) {
        return (
            <Alert sx={{ maxHeight: '100px' }} severity="error">
                {errMsg}
            </Alert>
        );
    } else if (hasSuccess) {
        return <Alert severity="success">Looking great!</Alert>;
    }
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
