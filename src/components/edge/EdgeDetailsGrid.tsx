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

import { useState } from 'react';

import IEdgeDevice from '../../types/IEdgeDevice';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { getHeartbeatTime, getStatus } from './edge-utils';
import EdgeInstallCommandDialog from './EdgeInstallCommandDialog';

export default function EdgeDetailsGrid({ edgeDevice }: { edgeDevice: IEdgeDevice | undefined }) {
    if (!edgeDevice) {
        return (
            <>
                <Grid container spacing={1} justifyContent="space-between">
                    <Grid item xs={12}>
                        Error: Could not fetch Edge Device
                    </Grid>
                </Grid>
            </>
        );
    }

    const [showEdgeInstallCommandDialog, setShowEdgeInstallCommandDialog] = useState(false);

    const status = getStatus(edgeDevice);
    const showRegistrationCommandButton = status === 'waiting for registration';

    const showEdgeInstallCommandDialogCommand = () => {
        setShowEdgeInstallCommandDialog(true);
    };

    const onShowEdgeInstallCommandDialogClose = () => {
        setShowEdgeInstallCommandDialog(false);
    };

    return (
        <>
            {showEdgeInstallCommandDialog ? (
                <EdgeInstallCommandDialog edgeDevice={edgeDevice} handleClose={onShowEdgeInstallCommandDialogClose} />
            ) : null}
            <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
                <Grid item xs={2}>
                    <b>Operating System:</b>
                </Grid>
                <Grid item xs={10}>
                    {edgeDevice.os || '-'}
                </Grid>
                <Grid item xs={2}>
                    <b>CPU:</b>
                </Grid>
                <Grid item xs={10}>
                    {edgeDevice.arch || 'unkown arch'}
                    {' - '}
                    {edgeDevice.cpu_count ? `${edgeDevice.cpu_count} Cores` : null}
                </Grid>
                <Grid item xs={2}>
                    <b>Memory:</b>
                </Grid>
                <Grid item xs={10}>
                    {edgeDevice.memory || '-'} MB
                </Grid>
                <Grid item xs={2}>
                    <b>Last Seen:</b>
                </Grid>
                <Grid item xs={10}>
                    {getHeartbeatTime(edgeDevice.last_heartbeat)}
                </Grid>
                <Grid item xs={2}>
                    <b>Status:</b>
                </Grid>
                <Grid item xs={10}>
                    <Grid container spacing={0} justifyContent="flex-start" alignItems="center">
                        <Grid item xs={6}>
                            {status}
                        </Grid>
                        {showRegistrationCommandButton ? (
                            <Grid item xs={6}>
                                <Button type="button" color="secondary" onClick={showEdgeInstallCommandDialogCommand}>
                                    Show Registration Command
                                </Button>
                            </Grid>
                        ) : null}
                    </Grid>
                </Grid>
                <Grid item xs={2}>
                    <b>Tags:</b>
                </Grid>
                <Grid item xs={10}>
                    {edgeDevice.tags?.map((tag) => {
                        return (
                            <span
                                key={tag}
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                    marginRight: '5px',
                                    borderRadius: '10px',
                                    padding: '1px 5px 1px 5px',
                                }}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </Grid>
            </Grid>
        </>
    );
}
