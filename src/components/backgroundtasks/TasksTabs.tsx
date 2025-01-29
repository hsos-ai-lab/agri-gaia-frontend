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
import { Box, Tabs, Tab } from '@mui/material';
import useKeycloak from '../../contexts/KeycloakContext';
import TasksList from './TasksList';
import { ApplicationTasks } from '../../contexts/TasksContext';
import { TaskStatus } from '../../types/TaskStatus';
import { IBackgroundTask } from '../../types/IBackgroundTask';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

interface TasksTabsProps {
    tasks: ApplicationTasks | undefined;
    taskHeight: number;
    onTaskDetails: (task: IBackgroundTask) => void;
    firstOpenTab?: number;
}

export default function (props: TasksTabsProps) {
    const keycloak = useKeycloak();
    const { tasks, taskHeight, onTaskDetails, firstOpenTab } = props;

    const [tabValue, setTabValue] = useState(firstOpenTab || 0);
    const handleTabValueChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const tasksList = tasks?.tasksList || [];

    const finishedTasks = tasksList.filter(
        (task) => task.status === TaskStatus.completed || task.status === TaskStatus.failed,
    );
    const unfinishedTasks = tasksList.filter(
        (task) => task.status === TaskStatus.created || task.status === TaskStatus.inprogress,
    );

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabValueChange}>
                    <Tab label="In Progress" />
                    <Tab label="Completed" />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <TasksList
                    rowHeight={taskHeight}
                    tasksList={unfinishedTasks}
                    emptyText="No tasks in progress"
                    onDelete={(task) => tasks?.deleteTask(keycloak, tasks, task)}
                    onTaskDetails={onTaskDetails}
                />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <TasksList
                    rowHeight={taskHeight}
                    tasksList={finishedTasks}
                    emptyText="No completed tasks"
                    onDelete={(task) => tasks?.deleteTask(keycloak, tasks, task)}
                    onTaskDetails={onTaskDetails}
                />
            </TabPanel>
        </>
    );
}
