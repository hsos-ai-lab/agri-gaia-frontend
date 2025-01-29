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
import { SwipeableDrawer, Box, Button, Typography, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { Autorenew } from '@mui/icons-material';
import { IBackgroundTask } from '../../types/IBackgroundTask';
import useApplicationTasks from '../../contexts/TasksContext';
import { TaskStatus } from '../../types/TaskStatus';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TasksTabs from './TasksTabs';
import TaskDetailsView from './TaskDetailsView';

const taskHeight = 60;
const minDrawerHeight = 500;

const createDrawerTheme = (taskCount: number) =>
    createTheme({
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: 'inherit',
                        textTransform: 'none',
                        padding: 'unset',
                        ':disabled': { color: 'white' },
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        position: 'absolute',
                        height: Math.max(taskCount * taskHeight + 62, minDrawerHeight),
                        borderColor: '#79ab2b',
                        borderStyle: 'solid',
                        borderTopWidth: 3,
                        borderRightWidth: 3,
                        borderLeftWidth: 3,
                        borderBottomWidth: 0,
                        overflow: 'visible',
                        width: 800,
                        left: 'auto',
                        right: 30,
                        bottom: 30,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    },
                },
            },
        },
    });

const getFirstOpenedTab = (task?: IBackgroundTask) => {
    if (task === undefined) {
        return task;
    }
    if (task.status === TaskStatus.created || task.status === TaskStatus.inprogress) {
        return 0;
    }
    return 1;
};

export default function () {
    const tasks = useApplicationTasks();
    const tasksList = tasks?.tasksList || [];

    const [open, setOpen] = useState(false);
    const [openedTask, setOpenedTask] = useState<IBackgroundTask | undefined>(undefined);
    const [lastOpenedTask, setLastOpenedTask] = useState<IBackgroundTask | undefined>(undefined);
    const hasActiveTasks = tasksList.filter((task) => task.status === TaskStatus.inprogress).length > 0;
    const failedTasks = tasksList.filter((task) => task.status === TaskStatus.failed);
    const finishedTasks = tasksList.filter(
        (task) => task.status === TaskStatus.completed || task.status === TaskStatus.failed,
    );
    const unfinishedTasks = tasksList.filter(
        (task) => task.status === TaskStatus.created || task.status === TaskStatus.inprogress,
    );

    const onTaskDetailsClose = () => {
        setLastOpenedTask(openedTask);
        setOpenedTask(undefined);
    };

    const getFooterButtonLabel = () => {
        const numRunningTasks = tasksList.filter((task) => task.status === TaskStatus.inprogress).length;
        return `${numRunningTasks} ${numRunningTasks == 1 ? 'Task' : 'Tasks'} running`;
    };

    return (
        <ThemeProvider theme={createDrawerTheme(Math.max(unfinishedTasks.length, finishedTasks.length))}>
            <Button
                variant="text"
                onClick={() => setOpen(!open)}
                startIcon={<Autorenew sx={{ animation: hasActiveTasks ? 'spin 4s linear infinite' : undefined }} />}
                endIcon={failedTasks.length > 0 ? <ErrorOutlineIcon color="error" /> : undefined}
            >
                <Typography> {getFooterButtonLabel()}</Typography>
            </Button>
            <SwipeableDrawer
                id="task-drawer"
                anchor="bottom"
                open={open}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                hideBackdrop={false}
                disableSwipeToOpen
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    {openedTask ? (
                        <TaskDetailsView task={openedTask} onClose={onTaskDetailsClose} />
                    ) : (
                        <TasksTabs
                            firstOpenTab={getFirstOpenedTab(lastOpenedTask)}
                            tasks={tasks}
                            taskHeight={taskHeight}
                            onTaskDetails={setOpenedTask}
                        />
                    )}
                </Box>
            </SwipeableDrawer>
        </ThemeProvider>
    );
}
