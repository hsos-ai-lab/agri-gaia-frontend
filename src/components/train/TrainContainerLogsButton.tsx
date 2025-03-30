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

import { httpGet } from '../../api';
import useKeycloak from '../../contexts/KeycloakContext';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useInterval } from '../../util';

import { TRAIN_CONTAINERS_PATH } from '../../endpoints';

export default function ({
    trainContainerId,
    repository,
    tag,
    disabled,
}: {
    trainContainerId: number;
    repository: string;
    tag: string;
    disabled: boolean;
}) {
    const keycloak = useKeycloak();

    const [logs, setLogs] = useState<string>('');
    const [logsOpen, setLogsOpen] = useState<boolean>(false);

    useInterval(() => {
        fetchTrainContainerLogs(50);
    }, 5);

    const fetchTrainContainerLogs = async (limit: number | undefined) => {
        const tail = limit ? `?tail=${limit}` : '';
        httpGet(keycloak, `${TRAIN_CONTAINERS_PATH}/${trainContainerId}/logs${tail}`)
            .then((trainContainerLogs) => {
                console.log(`Logs for train container '${trainContainerId}':`, trainContainerLogs);
                setLogs(trainContainerLogs.logs);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            {logsOpen ? (
                <Dialog open={logsOpen} fullWidth maxWidth={'lg'}>
                    <DialogTitle>Train Container Logs</DialogTitle>
                    <DialogContent>
                        Showing logs of {repository}:{tag}:
                        <CodeEditor
                            value={logs}
                            language="bash"
                            readOnly={true}
                            placeholder={`Loading train container logs...`}
                            padding={15}
                            style={{
                                fontSize: 12,
                                fontFamily:
                                    'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setLogsOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            ) : null}
            <Tooltip title="Show Logs">
                <span>
                    <IconButton
                        aria-label="open"
                        disabled={disabled}
                        onClick={() => {
                            fetchTrainContainerLogs(50);
                            setLogsOpen(true);
                        }}
                    >
                        <ListAltIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </>
    );
}
