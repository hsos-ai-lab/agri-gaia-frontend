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

import { IBackgroundTask } from '../../types/IBackgroundTask';
import { Grid, IconButton, Typography, Box, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getLocalDateTime } from '../../util';
import { getTaskStatusColor } from './utils';
import { TaskStatusType } from '../../types/TaskStatus';

const GridRow = ({ label, value }: { label: string; value: unknown }) => {
    return (
        <>
            <Grid item xs={4}>
                <b>{label}:</b>
            </Grid>
            <Grid item xs={8}>
                {value}
            </Grid>
        </>
    );
};

const TaskStatusTypography = ({ status }: { status: TaskStatusType }) => (
    <Typography sx={{ color: getTaskStatusColor(status) }}>{status}</Typography>
);

export default function ({ task, onClose }: { task: IBackgroundTask; onClose: () => void }) {
    return (
        <>
            <Box>
                <Grid container alignItems="center" sx={{ py: 1 }}>
                    <Grid item xs={1}>
                        <IconButton onClick={onClose}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Grid>
                    <Grid item xs={11}>
                        <Typography variant="h6" component="h6">
                            Title: {task.title || 'No Task title'}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider />
                <Grid container alignItems="center" sx={{ pt: 3 }} spacing={1}>
                    <GridRow label="Initiator" value={task.initiator || '-'} />
                    <GridRow label="Creation date" value={getLocalDateTime(task.creation_date)} />
                    <GridRow label="Status" value={<TaskStatusTypography status={task.status} />} />
                    <GridRow label="Completion Percentage" value={task.completion_percentage * 100 + ' %'} />
                    {task.message && <GridRow label="Message" value={task.message} />}
                </Grid>
            </Box>
        </>
    );
}
